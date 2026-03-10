const StudentLeave = require('../models/StudentLeave');
const User = require('../models/User');
const ClassAdvisor = require('../models/ClassAdvisor');
const Notification = require('../models/Notification'); // Assuming a global notification model exists

// @desc    Apply for leave (Student)
// @route   POST /api/student-leaves
// @access  Private/Student
exports.applyForLeave = async (req, res) => {
    try {
        const { leaveType, startDate, endDate, reason, attachmentUrl } = req.body;

        // Find the student's class advisor precisely
        let advisorId = req.user.classAdvisor;

        if (!advisorId) {
            // Fallback: Find the advisor assigned to this department and academic year
            const advisorRecord = await ClassAdvisor.findOne({
                department: req.user.department,
                academicYear: req.user.academicYear
            });
            if (advisorRecord) {
                advisorId = advisorRecord.staff;
            }
        }

        if (!advisorId) {
            return res.status(400).json({ success: false, message: 'Class Advisor not assigned for your year/department.' });
        }

        const leave = new StudentLeave({
            studentId: req.user._id,
            department: req.user.department,
            classAdvisorId: advisorId,
            leaveType,
            startDate,
            endDate,
            reason,
            attachmentUrl
        });

        await leave.save();

        // Notify Advisor
        try {
            await Notification.create({
                user: advisor._id,
                type: 'Info',
                title: 'New Student Leave Request',
                message: `${req.user.fullName || req.user.username} has applied for ${leaveType} leave.`
            });
        } catch (notifErr) {
            console.error('Notification error:', notifErr.message);
        }

        res.status(201).json({ success: true, data: leave });
    } catch (error) {
        console.error('Apply leave error:', error);
        res.status(500).json({ success: false, message: 'Server error applying for leave.' });
    }
};

// @desc    Get student's own leaves
// @route   GET /api/student-leaves/me
// @access  Private/Student
exports.getMyLeaves = async (req, res) => {
    try {
        const leaves = await StudentLeave.find({ studentId: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: leaves.length, data: leaves });
    } catch (error) {
        console.error('Get my leaves error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching leaves.' });
    }
};

// @desc    Get leaves for advisor's class
// @route   GET /api/student-leaves/advisor
// @access  Private/Class Advisor
exports.getLeavesForAdvisor = async (req, res) => {
    try {
        const leaves = await StudentLeave.find({ classAdvisorId: req.user._id })
            .populate('studentId', 'fullName registerNumber email')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: leaves.length, data: leaves });
    } catch (error) {
        console.error('Get advisor leaves error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching leaves.' });
    }
};

// @desc    Get all department leaves (HOD Read-only)
// @route   GET /api/student-leaves/department
// @access  Private/HOD
exports.getDepartmentLeaves = async (req, res) => {
    try {
        const dept = req.user.department?.toString().trim();
        const leaves = await StudentLeave.find({ department: dept })
            .populate({ path: 'studentId', select: 'fullName registerNumber', options: { strictPopulate: false } })
            .populate({ path: 'classAdvisorId', select: 'fullName username', options: { strictPopulate: false } })
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({ success: true, count: leaves.length, data: leaves || [] });
    } catch (error) {
        console.error('Get department leaves error:', error.message, error.stack);
        res.status(500).json({ success: false, message: 'Server error fetching department leaves.', error: error.message });
    }
};

// @desc    Get all institutional leaves (Principal/Admin)
// @route   GET /api/student-leaves/institutional
// @access  Private/Principal, Admin
exports.getInstitutionalLeaves = async (req, res) => {
    try {
        const leaves = await StudentLeave.find({})
            .populate({ path: 'studentId', select: 'fullName registerNumber department', options: { strictPopulate: false } })
            .populate({ path: 'classAdvisorId', select: 'fullName username', options: { strictPopulate: false } })
            .sort({ createdAt: -1 })
            .limit(100)
            .lean();

        res.status(200).json({ success: true, count: leaves.length, data: leaves || [] });
    } catch (error) {
        console.error('Get institutional leaves error:', error.message);
        res.status(500).json({ success: false, message: 'Server error fetching institutional leaves.' });
    }
};

// @desc    Get leave statistics for Principal Dashboard
// @route   GET /api/student-leaves/stats
// @access  Private/Principal, Admin
exports.getLeaveStats = async (req, res) => {
    try {
        const stats = await StudentLeave.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        const deptStats = await StudentLeave.aggregate([
            {
                $group: {
                    _id: "$department",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        res.status(200).json({
            success: true,
            summary: stats.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {}),
            byDepartment: deptStats
        });
    } catch (error) {
        console.error('Get leave stats error:', error.message);
        res.status(500).json({ success: false, message: 'Server error fetching leave stats.' });
    }
};

// Helper to apply approved leave/OD to existing attendance records
const applyLeaveToAttendance = async (studentId, startDate, endDate, leaveType) => {
    try {
        const Attendance = require('../models/Attendance');

        // Final status mapping
        const finalStatus = leaveType === 'OD' ? 'OD' : 'Leave';

        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        // Find all attendance records for this student in the date range
        const records = await Attendance.find({
            date: { $gte: start, $lte: end },
            'records.student': studentId
        });

        // Update each record
        for (const session of records) {
            let modified = false;
            session.records = session.records.map(r => {
                if (r.student.toString() === studentId.toString()) {
                    r.status = finalStatus;
                    modified = true;
                }
                return r;
            });
            if (modified) {
                await session.save();
            }
        }
    } catch (err) {
        console.error('Error applying leave to attendance:', err.message);
    }
};

// @desc    Update leave status (Approve/Reject)
// @route   PUT /api/student-leaves/:id/status
// @access  Private/Class Advisor
exports.updateLeaveStatus = async (req, res) => {
    try {
        const { status, remarks } = req.body;

        const leave = await StudentLeave.findById(req.params.id);

        if (!leave) {
            return res.status(404).json({ success: false, message: 'Leave request not found.' });
        }

        // Verify advisor ownership
        if (leave.classAdvisorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this leave request.' });
        }

        leave.status = status;
        if (remarks) leave.remarks = remarks;

        await leave.save();

        // If approved, apply to attendance
        if (status === 'Approved') {
            await applyLeaveToAttendance(leave.studentId, leave.startDate, leave.endDate, leave.leaveType);
        }

        // Notify Student
        try {
            await Notification.create({
                user: leave.studentId,
                type: 'Info',
                title: `Leave Request ${status}`,
                message: `Your ${leave.leaveType} leave request has been ${status.toLowerCase()} by your advisor.`
            });
        } catch (notifErr) {
            console.error('Notification error:', notifErr.message);
        }

        res.status(200).json({ success: true, data: leave });
    } catch (error) {
        console.error('Update leave error:', error);
        res.status(500).json({ success: false, message: 'Server error updating leave status.' });
    }
};
