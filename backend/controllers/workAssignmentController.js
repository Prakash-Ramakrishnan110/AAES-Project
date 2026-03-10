const WorkAssignment = require('../models/WorkAssignment');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Assign work to a staff member
// @route   POST /api/work-assignments
// @access  Private/HOD
exports.assignWork = async (req, res) => {
    try {
        const { title, description, assignedStaffId, startDate, dueDate, priority } = req.body;
        const department = req.user.department?.toString().trim();
        const userId = req.user._id;
        console.log('[DEBUG] assignWork START', { userId, userDept: department, targetId: assignedStaffId });

        // Verify the assigned staff belongs to the same department
        const targetStaff = await User.findById(assignedStaffId);

        if (!targetStaff) {
            console.log('[DEBUG] assignWork - Target staff NOT FOUND in DB');
            return res.status(404).json({ success: false, message: 'Staff member not found.' });
        }

        const staffDept = targetStaff.department?.toString().trim();
        const staffRole = targetStaff.role?.toLowerCase();
        console.log('[DEBUG] assignWork - Target found', { staffName: targetStaff.username, staffDept, staffRole });

        // Strict validation: must be in same department and have 'staff' role
        // Added some flexibility for the comparison just in case
        const deptMatch = String(staffDept).toLowerCase().trim() === String(department).toLowerCase().trim();
        const roleMatch = staffRole === 'staff';

        if (!deptMatch || !roleMatch) {
            console.log('[DEBUG] assignWork - VALIDATION FAILED', { staffDept, userDept: department, staffRole, deptMatch, roleMatch });
            return res.status(403).json({
                success: false,
                message: `Cannot assign task: Staff department (${staffDept}) does not match your department (${department}), or the selected user is not a staff member (role: ${targetStaff.role}).`,
                debug: { staffDept, userDept: department, staffRole }
            });
        }

        const task = new WorkAssignment({
            title,
            description,
            department: department,
            assignedStaffId,
            assignedBy: userId,
            startDate,
            dueDate,
            priority
        });

        await task.save();

        // Notify the staff member
        try {
            await Notification.create({
                user: assignedStaffId,
                title: `New Task Assigned: ${title}`,
                message: `You have been assigned a new task by the HOD. Due on ${new Date(dueDate).toLocaleDateString()}.`,
                type: 'Info',
                link: '/staff/my-work'
            });
        } catch (notifErr) {
            console.error('[DEBUG] Notification Error:', notifErr.message);
        }

        res.status(201).json({ success: true, data: task });
    } catch (error) {
        console.error('[DEBUG] assignWork CATCH ERROR:', error);
        res.status(500).json({ success: false, message: 'Server error assigning work.', error: error.message });
    }
};

// @desc    Get all work assignments for the department
// @route   GET /api/work-assignments/department
// @access  Private/HOD
exports.getDepartmentWork = async (req, res) => {
    try {
        const dept = req.user.department?.toString().trim();
        console.log('[DEBUG] getDepartmentWork - depth:', dept);

        const tasks = await WorkAssignment.find({ department: new RegExp(`^${dept}$`, 'i') })
            .populate({ path: 'assignedStaffId', select: 'fullName username email', options: { strictPopulate: false } })
            .populate({ path: 'assignedBy', select: 'fullName username', options: { strictPopulate: false } })
            .sort({ dueDate: 1 })
            .lean();

        res.status(200).json({ success: true, data: tasks || [] });
    } catch (error) {
        console.error('[DEBUG] getDepartmentWork ERROR:', error);
        res.status(500).json({ success: false, message: 'Server error fetching department tasks.', error: error.message, stack: error.stack });
    }
};

// @desc    Get my assigned work
// @route   GET /api/work-assignments/me
// @access  Private/Staff
exports.getMyWork = async (req, res) => {
    try {
        const tasks = await WorkAssignment.find({ assignedStaffId: req.user._id })
            .populate('assignedBy', 'fullName username')
            .sort({ dueDate: 1 });

        res.status(200).json({ success: true, data: tasks });
    } catch (error) {
        console.error('Get my work error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching your tasks.' });
    }
};

// @desc    Update task status
// @route   PUT /api/work-assignments/:id/status
// @access  Private/Staff
exports.updateTaskStatus = async (req, res) => {
    try {
        const { status } = req.body;

        let task = await WorkAssignment.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found.' });
        }

        // Verify it belongs to the logged in staff
        if (task.assignedStaffId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this task.' });
        }

        task.status = status;
        await task.save();

        // Optionally notify HOD if completed
        if (status === 'Completed') {
            await Notification.create({
                user: task.assignedBy, // The HOD
                title: `Task Completed: ${task.title}`,
                message: `${req.user.name} has completed their assigned task.`,
                type: 'Success',
                link: '/hod/work-assignments'
            });
        }

        res.status(200).json({ success: true, data: task });
    } catch (error) {
        console.error('Update task status error:', error);
        res.status(500).json({ success: false, message: 'Server error updating task status.' });
    }
};
