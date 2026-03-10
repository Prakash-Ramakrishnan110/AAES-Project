const MentorshipQuery = require('../models/MentorshipQuery');
const MentorHistory = require('../models/MentorHistory');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// Helper: Create Audit Log
const createAuditLog = async (action, performedBy, targetId, department, details = {}) => {
    try {
        await AuditLog.create({
            action, performedBy, targetId, targetModel: 'MentorshipQuery', department, details
        });
    } catch (error) {
        console.error('Audit Log Error:', error);
    }
};

// @desc    Get mentorship queries
// @route   GET /api/mentorship
// @access  Private
const getQueries = async (req, res) => {
    let filter = {};

    if (req.user.role === 'student') {
        filter.student = req.user.id;
    } else if (req.user.role === 'staff') {
        filter.mentor = req.user.id;
    } else if (req.user.role === 'hod' || req.user.role === 'admin') {
        filter.department = req.user.department || req.query.department;
        if (!filter.department && req.user.role === 'admin') delete filter.department;
    } else {
        return res.status(403).json({ message: 'Not authorized' });
    }

    try {
        const queries = await MentorshipQuery.find(filter)
            .populate('student', 'username fullName registerNumber profileImage')
            .populate('mentor', 'username fullName profileImage')
            .sort({ createdAt: -1 });
        res.json(queries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new mentorship query
// @route   POST /api/mentorship
// @access  Private/Student
const createQuery = async (req, res) => {
    try {
        const { queryType, message, priority } = req.body;

        if (req.user.role !== 'student') {
            return res.status(403).json({ message: 'Only students can initiate a mentorship query' });
        }

        if (!message || message.trim().length < 10) {
            return res.status(400).json({ message: 'Message must be at least 10 characters long.' });
        }

        // Must fetch the complete student user explicitly to retrieve the mentor mapping
        const studentObj = await User.findById(req.user.id);

        if (!studentObj.mentor) {
            return res.status(400).json({ message: 'No Class Advisor assigned. Please contact your HOD.' });
        }

        // Check for spam limit
        const openQueriesCount = await MentorshipQuery.countDocuments({ student: req.user.id, status: 'Open' });
        if (openQueriesCount >= 3) {
            return res.status(400).json({ message: 'Maximum of 3 open queries allowed. Please wait for resolution before opening more.' });
        }

        const query = await MentorshipQuery.create({
            student: req.user.id,
            mentor: studentObj.mentor,
            department: req.user.department,
            queryType,
            priority: priority || 'Medium',
            message
        });

        res.status(201).json(query);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Reply to a query and optionally mark it resolved
// @route   PUT /api/mentorship/:id
// @access  Private/Staff (Advisor)
const replyQuery = async (req, res) => {
    try {
        const { reply, status, followUpDate } = req.body;
        console.log(`[DEBUG] Reply Attempt: QueryID=${req.params.id}, UserID=${req.user._id}, Role=${req.user.role}`);

        const query = await MentorshipQuery.findById(req.params.id);

        if (!query) {
            console.log(`[DEBUG] Query not found: ${req.params.id}`);
            return res.status(404).json({ message: 'Query not found' });
        }

        // Lock already resolved queries
        if (query.status === 'Resolved') {
            return res.status(400).json({ message: 'Cannot modify a resolved query' });
        }

        // Only the assigned mentor can reply, not HOD/Admin.
        const isMatch = query.mentor.toString() === req.user.id.toString();
        console.log(`[DEBUG] Mentor Match: ${isMatch} (Query.mentor=${query.mentor}, User.id=${req.user.id})`);

        if (req.user.role !== 'staff' || !isMatch) {
            const reason = req.user.role !== 'staff' ? 'Role is not staff' : 'Mentor ID mismatch';
            await createAuditLog('REPLY_FAILED_AUTH', req.user.id, query._id, query.department, { reason });
            return res.status(403).json({ message: 'Only the assigned mentor can reply to this query' });
        }

        if (reply) query.reply = reply;
        if (status) {
            query.status = status;
            if (status === 'Resolved') {
                query.resolvedAt = Date.now();
            }
        }
        if (followUpDate) query.followUpDate = followUpDate;

        await query.save();
        console.log(`[DEBUG] Query saved successfully: ${query._id}`);

        await createAuditLog('REPLY_MENTORSHIP_QUERY', req.user.id, query._id, query.department, { status });

        res.json(query);
    } catch (error) {
        console.error(`[DEBUG] Reply Error:`, error);
        await createAuditLog('REPLY_FAILED_ERROR', req.user.id, req.params.id, 'UNKNOWN', { error: error.message });
        res.status(400).json({ message: error.message });
    }
};

// @desc    Assign Mentors to Students (Bulk)
// @route   POST /api/mentorship/assign
// @access  Private/Staff (Advisor), HOD, Admin
const assignMentors = async (req, res) => {
    try {
        const { studentIds, mentorId } = req.body;

        if (!studentIds || !Array.isArray(studentIds) || !mentorId) {
            return res.status(400).json({ message: 'Please provide studentIds and mentorId' });
        }

        // Close old MentorHistory records
        await MentorHistory.updateMany(
            { student: { $in: studentIds }, status: 'Active' },
            { $set: { status: 'Previous', removedAt: new Date() } }
        );

        // Insert new active MentorHistory records
        const newHistories = studentIds.map(studentId => ({
            student: studentId,
            mentor: mentorId,
            assignedBy: req.user.id,
            status: 'Active',
            assignedAt: new Date()
        }));
        await MentorHistory.insertMany(newHistories);

        // Update User.mentor direct reference
        await User.updateMany(
            { _id: { $in: studentIds } },
            { $set: { mentor: mentorId } }
        );

        // Sync to MentorStudentMap (used by MentorshipGovernance dashboard)
        const MentorStudentMap = require('../models/MentorStudentMap');
        const mentorUser = await User.findById(mentorId).select('academicYear');
        const academicYear = mentorUser?.academicYear || new Date().getFullYear() + '-' + (new Date().getFullYear() + 1);

        for (const studentId of studentIds) {
            await MentorStudentMap.findOneAndUpdate(
                { student: studentId, academicYear },
                { mentor: mentorId, assignedBy: req.user.id, isActive: true, academicYear },
                { upsert: true, new: true }
            );
        }

        await createAuditLog('ASSIGN_MENTORS', req.user.id, mentorId, req.user.department, { studentCount: studentIds.length });

        res.json({ message: `Successfully assigned mentor to ${studentIds.length} students` });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


// @desc    Get assigned mentees for a mentor
// @route   GET /api/mentorship/my-mentees
// @access  Private/Staff
const getMyMentees = async (req, res) => {
    try {
        const mentees = await User.find({ mentor: req.user.id, isActive: true })
            .select('username fullName registerNumber department profileImage academicYear semester');

        // Wrap the students to preserve frontend compatibility
        const responseData = mentees.map(student => ({ student }));
        res.json(responseData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Get all active staff (for mentor assignment dropdown)
// @route   GET /api/mentorship/staff
// @access  Private/Staff(Advisor)/HOD/Admin
const getStaffForMentorAssignment = async (req, res) => {
    try {
        const staffList = await User.find({ role: 'staff', isActive: true })
            .select('username fullName department staffId profileImage')
            .sort({ fullName: 1 });
        res.json(staffList);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getQueries,
    createQuery,
    replyQuery,
    assignMentors,
    getMyMentees,
    getStaffForMentorAssignment
};
