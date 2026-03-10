const Notification = require('../models/Notification');

// @desc    Get all notifications for logged in user
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        if (notification.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        notification.read = true;
        await notification.save();
        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.user._id, read: false },
            { $set: { read: true } }
        );
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Send announcement to a group or specific users
// @route   POST /api/notifications/send
// @access  Private (Admin, HOD, Staff, Principal)
const sendAnnouncement = async (req, res) => {
    try {
        const { title, message, targetGroup, specificUserIds } = req.body;
        const sender = req.user;

        console.log('[DEBUG] sendAnnouncement body:', { title, message, targetGroup, specificUserIds });
        console.log('[DEBUG] sender info:', { id: sender._id, role: sender.role, dept: sender.department });

        if (!title || !message || (!targetGroup && !specificUserIds)) {
            console.log('[DEBUG] Validation failed: missing fields');
            return res.status(400).json({ message: 'Title, message, and target are required' });
        }

        let recipients = [];

        if (specificUserIds && Array.isArray(specificUserIds) && specificUserIds.length > 0) {
            recipients = specificUserIds;
        } else if (targetGroup) {
            const User = require('../models/User');
            let query = { isActive: true };

            // Restrict based on sender's role and department
            if (sender.role === 'hod' || sender.role === 'staff') {
                query.department = sender.department;
            }

            switch (targetGroup) {
                case 'all_students':
                    query.role = 'student';
                    break;
                case 'all_staff':
                    query.role = 'staff';
                    break;
                case 'all_department':
                    // all in dept (students + staff)
                    query.role = { $in: ['student', 'staff'] };
                    break;
                case 'class_advisors':
                    const ClassAdvisor = require('../models/ClassAdvisor');
                    const advisors = await ClassAdvisor.find(sender.role === 'hod' ? { department: sender.department } : {}).select('staff');
                    query._id = { $in: advisors.map(a => a.staff) };
                    break;
                case 'all_hods':
                    if (sender.role !== 'admin' && sender.role !== 'principal') {
                        return res.status(403).json({ message: 'Only Admin/Principal can send to all HODs' });
                    }
                    query.role = 'hod';
                    break;
                default:
                    return res.status(400).json({ message: 'Invalid target group' });
            }

            const users = await User.find(query).select('_id');
            recipients = users.map(u => u._id);
            console.log('[DEBUG] Query generated:', JSON.stringify(query));
            console.log('[DEBUG] Recipients count found:', recipients.length);
        }

        if (recipients.length === 0) {
            console.log('[DEBUG] No recipients found for selection');
            return res.status(404).json({ message: 'No recipients found for this selection' });
        }

        const notifications = recipients.map(userId => ({
            user: userId,
            title: `📢 ${title}`,
            message: `${message}\n\n- Sent by ${sender.fullName || sender.username}`,
            type: 'Grading', // Using Grading as a generic "Announcement" type for now as it has a Megaphone icon
            read: false
        }));

        try {
            await Notification.insertMany(notifications);
            console.log('[DEBUG] Successfully inserted notifications');
        } catch (dbErr) {
            console.error('[DEBUG] Notification.insertMany FAILED:', dbErr);
            throw dbErr;
        }

        res.status(201).json({
            success: true,
            message: `Announcement sent to ${recipients.length} recipients`,
            count: recipients.length
        });
    } catch (error) {
        console.error('[DEBUG] sendAnnouncement FATAL ERROR:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Send Emergency Broadcast
// @route   POST /api/notifications/emergency
// @access  Private/Principal/Admin
const sendEmergencyBroadcast = async (req, res) => {
    try {
        const { title, message } = req.body;
        const User = require('../models/User');

        // Find all active users
        const users = await User.find({ isActive: true }).select('_id');

        const notifications = users.map(user => ({
            user: user._id,
            title: `🚨 EMERGENCY: ${title}`,
            message,
            type: 'Alert',
            priority: 'Emergency',
            read: false
        }));

        await Notification.insertMany(notifications);

        res.status(201).json({
            success: true,
            message: `Emergency broadcast sent to ${users.length} users`
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllNotificationsForPrincipal = async (req, res) => {
    try {
        const { department } = req.query;
        let query = { type: { $in: ['Grading', 'Alert', 'Info'] } };

        let notifications = await Notification.find(query)
            .populate('user', 'fullName department role')
            .sort({ createdAt: -1 })
            .limit(500);

        // Filter by department if requested
        if (department) {
            notifications = notifications.filter(n => n.user && n.user.department === department);
        }

        // Return unique announcements to avoid cluttering the Principal's view
        const uniqueAnnouncements = [];
        const seen = new Set();

        notifications.forEach(n => {
            const contentKey = `${n.title}-${n.message}-${new Date(n.createdAt).setSeconds(0, 0)}`;
            if (!seen.has(contentKey)) {
                uniqueAnnouncements.push(n);
                seen.add(contentKey);
            }
        });

        res.json(uniqueAnnouncements.slice(0, 50));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getNotifications,
    markRead,
    markAllRead,
    sendAnnouncement,
    sendEmergencyBroadcast,
    getAllNotificationsForPrincipal
};
