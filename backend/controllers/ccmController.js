const CCM = require('../models/CCM');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Helper: Create Audit Log
const createAuditLog = async (action, performedBy, targetId, department, details = {}) => {
    try {
        await AuditLog.create({
            action, performedBy, targetId, targetModel: 'CCM', department, details
        });
    } catch (error) {
        console.error('Audit Log Error:', error);
    }
};

// @desc    Get all CCMs for a department
// @route   GET /api/ccm
// @access  Private/HOD/Staff
const getCCMs = async (req, res) => {
    try {
        const department = req.user.department;
        const filter = { department };

        if (req.user.role === 'staff') {
            // Staff maybe only sees CCMs they created, or all in department?
            // Usually all in department is fine, or just their own. Let's show their own for now, or all if they are just reading.
            // Requirement says: "HOD View: All CCM records in department". Advisor View: "My Class -> CCM Meetings".
            // We'll filter by createdBy for staff to ensure they only see their own class's CCM.
            filter.createdBy = req.user.id;
        }

        const ccms = await CCM.find(filter)
            .populate('createdBy', 'username fullName profileImage')
            .populate('studentReps', 'username fullName registerNumber')
            .sort({ meetingDate: -1 });

        res.json(ccms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new CCM
// @route   POST /api/ccm
// @access  Private/Staff (Advisor)
const createCCM = async (req, res) => {
    try {
        const { academicYear, meetingDate, agenda, notes, decisions, studentReps, category, studentRepsPresent, absentCount } = req.body;

        if (req.user.role !== 'staff') {
            return res.status(403).json({ message: 'Only Class Advisors (Staff) can create CCMs' });
        }

        // Handle file upload if present
        const minutesPDF = req.file ? `/uploads/${req.file.filename}` : '';

        // Parse studentReps if it's sent as a JSON string (due to multipart/form-data)
        let parsedReps = [];
        if (studentReps) {
            try {
                parsedReps = typeof studentReps === 'string' ? JSON.parse(studentReps) : studentReps;
            } catch (e) {
                parsedReps = [];
            }
        }

        const ccm = await CCM.create({
            department: req.user.department,
            academicYear,
            meetingDate,
            createdBy: req.user.id,
            category: category || 'Academic',
            agenda,
            notes,
            decisions,
            studentReps: parsedReps,
            studentRepsPresent: parseInt(studentRepsPresent) || 0,
            absentCount: parseInt(absentCount) || 0,
            minutesPDF
        });

        await createAuditLog('CREATE_CCM', req.user.id, ccm._id, req.user.department, { agenda });

        // Notify Student Representatives
        if (parsedReps && parsedReps.length > 0) {
            for (const repId of parsedReps) {
                await Notification.create({
                    user: repId,
                    title: 'CCM Meeting Scheduled',
                    message: `You have been selected as a representative for the CCM meeting on ${new Date(meetingDate).toLocaleDateString()}. Agenda: ${agenda}`,
                    type: 'Info',
                    link: '/student/dashboard'
                });
            }
        }

        res.status(201).json(ccm);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get single CCM by ID (mostly for HOD/Advisor review)
// @route   GET /api/ccm/:id
// @access  Private
const getCCMById = async (req, res) => {
    try {
        const ccm = await CCM.findById(req.params.id)
            .populate('createdBy', 'username fullName')
            .populate('studentReps', 'username fullName registerNumber');

        if (!ccm) return res.status(404).json({ message: 'CCM not found' });

        if (req.user.role === 'staff' && ccm.createdBy._id.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'Not authorized to view other class CCMs' });
        }

        if (req.user.role === 'hod' && ccm.department !== req.user.department) {
            return res.status(403).json({ message: 'Not authorized to view other department CCMs' });
        }

        res.json(ccm);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Add Action Item to a CCM
// @route   POST /api/ccm/:id/actions
// @access  Private/Staff (Advisor)
const addActionItem = async (req, res) => {
    try {
        const { description, responsiblePerson, deadline } = req.body;
        const ccm = await CCM.findById(req.params.id);

        if (!ccm) return res.status(404).json({ message: 'CCM not found' });

        if (ccm.createdBy.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        ccm.actionItems.push({
            description,
            responsiblePerson,
            deadline
        });

        await ccm.save();
        res.status(201).json(ccm);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update Action Item Status
// @route   PUT /api/ccm/:id/actions/:actionId
// @access  Private/Staff (Advisor)
const updateActionItem = async (req, res) => {
    try {
        const { status } = req.body;
        const ccm = await CCM.findById(req.params.id);

        if (!ccm) return res.status(404).json({ message: 'CCM not found' });

        if (ccm.createdBy.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const actionItem = ccm.actionItems.id(req.params.actionId);
        if (!actionItem) return res.status(404).json({ message: 'Action item not found' });

        actionItem.status = status;
        await ccm.save();

        res.json(ccm);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getCCMs,
    createCCM,
    getCCMById,
    addActionItem,
    updateActionItem
};
