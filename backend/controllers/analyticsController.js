const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const User = require('../models/User');
const Subject = require('../models/Subject');
const MentorshipQuery = require('../models/MentorshipQuery');
const MentorStudentMap = require('../models/MentorStudentMap');
const CCM = require('../models/CCM');

// @desc    Get aggregated performance stats by Department
// @route   GET /api/analytics/department
// @access  Private/Admin
const getDepartmentPerformance = async (req, res) => {
    try {
        // 1. Group Submissions by Student -> then by Department
        // Since Submission -> Student (User), we need to aggregate via lookup

        const stats = await Submission.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'student',
                    foreignField: '_id',
                    as: 'studentInfo'
                }
            },
            { $unwind: '$studentInfo' },
            {
                $match: { status: 'graded' } // Only consider graded submissions
            },
            {
                $group: {
                    _id: '$studentInfo.department',
                    avgMarks: { $avg: '$marks' },
                    totalSubmissions: { $sum: 1 }
                }
            },
            {
                $project: {
                    department: '$_id',
                    avgMarks: { $round: ['$avgMarks', 1] },
                    totalSubmissions: 1,
                    _id: 0
                }
            }
        ]);

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// @desc    Get aggregated performance stats by Semester (Optional Dept Filter)
// @route   GET /api/analytics/semester
// @access  Private/Admin/HOD
const getSemesterTrends = async (req, res) => {
    try {
        const matchStage = { status: 'graded' };

        // If HOD, force filter by their department
        if (req.user.role === 'hod' && req.user.department) {
            matchStage['studentInfo.department'] = req.user.department;
        }

        const stats = await Submission.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'student',
                    foreignField: '_id',
                    as: 'studentInfo'
                }
            },
            { $unwind: '$studentInfo' },
            { $match: matchStage }, // Apply filter here
            {
                $group: {
                    _id: '$studentInfo.semester',
                    avgMarks: { $avg: '$marks' },
                    totalSubmissions: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            },
            {
                $project: {
                    semester: '$_id',
                    avgMarks: { $round: ['$avgMarks', 1] },
                    totalSubmissions: 1,
                    _id: 0
                }
            }
        ]);

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get aggregated performance stats by Subject (Optional Dept Filter)
// @route   GET /api/analytics/subject
// @access  Private/Admin/Staff/HOD
const getSubjectPerformance = async (req, res) => {
    try {
        const matchStage = { status: 'graded' };

        // If HOD, force filter by their department via Subject (since Assignment -> Subject -> Dept)
        // Note: Logic below joins Assignment -> Subject. We can filter on Subject.department.

        const filterDepartment = (req.user.role === 'hod') ? req.user.department : null;

        const pipeline = [
            {
                $lookup: {
                    from: 'assignments',
                    localField: 'assignment',
                    foreignField: '_id',
                    as: 'assignmentInfo'
                }
            },
            { $unwind: '$assignmentInfo' },
            {
                $lookup: {
                    from: 'subjects',
                    localField: 'assignmentInfo.subject',
                    foreignField: '_id',
                    as: 'subjectInfo'
                }
            },
            { $unwind: '$subjectInfo' },
            { $match: { status: 'graded' } }
        ];

        if (filterDepartment) {
            pipeline.push({
                $match: { 'subjectInfo.department': filterDepartment }
            });
        }

        if (req.user.role === 'staff') {
            pipeline.push({
                $match: { 'subjectInfo.staff': req.user._id }
            });
        }

        pipeline.push(
            {
                $group: {
                    _id: '$subjectInfo.name',
                    avgMarks: { $avg: '$marks' },
                    totalSubmissions: { $sum: 1 }
                }
            },
            {
                $project: {
                    subject: '$_id',
                    avgMarks: { $round: ['$avgMarks', 1] },
                    totalSubmissions: 1,
                    _id: 0
                }
            }
        );

        const stats = await Submission.aggregate(pipeline);

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get HOD-specific stats (department-scoped)
// @route   GET /api/analytics/hod/stats
// @access  Private/HOD
const getHODStats = async (req, res) => {
    try {
        const hodDepartment = req.user.department;

        // Count staff in department
        const staffCount = await User.countDocuments({
            role: 'staff',
            department: hodDepartment
        });

        // Count students in department
        const studentCount = await User.countDocuments({
            role: 'student',
            department: hodDepartment
        });

        // Calculate average performance for department students
        const students = await User.find({
            role: 'student',
            department: hodDepartment
        });
        const studentIds = students.map(s => s._id);

        const submissions = await Submission.find({
            student: { $in: studentIds },
            status: 'graded'
        });

        const avgMarks = submissions.length > 0
            ? submissions.reduce((acc, curr) => acc + curr.marks, 0) / submissions.length
            : 0;

        // 4. Average Attendance
        const Attendance = require('../models/Attendance');
        const deptSubjects = await Subject.find({ department: hodDepartment });
        const subIds = deptSubjects.map(s => s._id);
        const attendanceDocs = await Attendance.find({ subject: { $in: subIds } });

        let totalRecords = 0;
        let presentCount = 0;
        attendanceDocs.forEach(doc => {
            doc.records.forEach(r => {
                totalRecords++;
                if (r.status === 'Present') presentCount++;
            });
        });
        const deptAvgAttendance = totalRecords > 0 ? (presentCount / totalRecords) * 100 : 0;

        // 5. Risk Count
        const StudentRisk = require('../models/StudentRisk');
        const riskCount = await StudentRisk.countDocuments({
            // Assuming StudentRisk might have dept or we link via User
            // Since User has dept, we can find users in dept first
            student: { $in: studentIds },
            riskLevel: 'Red'
        });

        res.json({
            staffCount,
            studentCount,
            avgMarks: Math.round(avgMarks * 10) / 10,
            avgAttendance: Math.round(deptAvgAttendance * 10) / 10,
            riskCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get aggregated performance stats by Staff (Optional Dept Filter)
// @route   GET /api/analytics/staff/performance
// @access  Private/Admin/HOD
const getStaffPerformance = async (req, res) => {
    try {
        const filterDepartment = (req.user.role === 'hod') ? req.user.department : null;

        const pipeline = [
            {
                $lookup: {
                    from: 'assignments',
                    localField: 'assignment',
                    foreignField: '_id',
                    as: 'assignmentInfo'
                }
            },
            { $unwind: '$assignmentInfo' },
            {
                $lookup: {
                    from: 'subjects',
                    localField: 'assignmentInfo.subject',
                    foreignField: '_id',
                    as: 'subjectInfo'
                }
            },
            { $unwind: '$subjectInfo' },
            {
                $lookup: {
                    from: 'users',
                    localField: 'subjectInfo.staff',
                    foreignField: '_id',
                    as: 'staffInfo'
                }
            },
            { $unwind: '$staffInfo' },
            { $match: { status: 'graded' } }
        ];

        if (filterDepartment) {
            pipeline.push({
                $match: { 'staffInfo.department': filterDepartment }
            });
        }

        pipeline.push(
            {
                $group: {
                    _id: '$staffInfo.username',
                    avgMarks: { $avg: '$marks' },
                    totalSubmissions: { $sum: 1 }
                }
            },
            {
                $project: {
                    staff: '$_id',
                    avgMarks: { $round: ['$avgMarks', 1] },
                    totalSubmissions: 1,
                    _id: 0
                }
            }
        );

        const stats = await Submission.aggregate(pipeline);

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get aggregated performance stats by Student (Top Performers, Optional Dept Filter)
// @route   GET /api/analytics/student/performance
// @access  Private/Admin/HOD
const getStudentPerformance = async (req, res) => {
    try {
        const filterDepartment = (req.user.role === 'hod') ? req.user.department : null;

        const pipeline = [
            {
                $lookup: {
                    from: 'users',
                    localField: 'student',
                    foreignField: '_id',
                    as: 'studentInfo'
                }
            },
            { $unwind: '$studentInfo' },
            { $match: { status: 'graded' } }
        ];

        if (filterDepartment) {
            pipeline.push({
                $match: { 'studentInfo.department': filterDepartment }
            });
        }

        pipeline.push(
            {
                $group: {
                    _id: '$studentInfo.username',
                    avgMarks: { $avg: '$marks' },
                    totalSubmissions: { $sum: 1 }
                }
            },
            {
                $sort: { avgMarks: -1 }
            },
            {
                $limit: 10
            },
            {
                $project: {
                    student: '$_id',
                    avgMarks: { $round: ['$avgMarks', 1] },
                    totalSubmissions: 1,
                    _id: 0
                }
            }
        );

        const stats = await Submission.aggregate(pipeline);

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Staff Workload Overview (HOD Panel)
// @route   GET /api/analytics/hod/workload
// @access  Private/HOD
const getStaffWorkload = async (req, res) => {
    try {
        const hodDepartment = req.user.department;

        // Find all staff in the department
        const staffList = await User.find({ role: 'staff', department: hodDepartment }).select('fullName username');

        const workload = await Promise.all(staffList.map(async (staff) => {
            // Count subjects
            const subjects = await Subject.find({ staff: staff._id });

            // Count active assignments for these subjects
            const subjectIds = subjects.map(s => s._id);
            const activeAssignments = await Assignment.countDocuments({
                subject: { $in: subjectIds },
                deadline: { $gte: new Date() }
            });

            // Sum total students across all subjects
            // (Note: Students might be the same across subjects, but "load" is per subject enrolment)
            let totalStudentLoad = 0;
            for (const subject of subjects) {
                const count = await User.countDocuments({
                    role: 'student',
                    department: hodDepartment,
                    semester: subject.semester,
                    academicYear: subject.academicYear
                });
                totalStudentLoad += count;
            }

            return {
                staffName: staff.fullName || staff.username,
                subjectCount: subjects.length,
                activeAssignments,
                totalStudentLoad
            };
        }));

        res.json(workload);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Assignment Performance Comparison
// @route   GET /api/analytics/hod/comparison
// @access  Private/HOD
const getAssignmentPerformanceComparison = async (req, res) => {
    try {
        const hodDepartment = req.user.department;

        const subjects = await Subject.find({ department: hodDepartment });

        const comparison = await Promise.all(subjects.map(async (subject) => {
            const submissions = await Submission.find({ status: 'graded' })
                .populate({
                    path: 'assignment',
                    match: { subject: subject._id }
                });

            const subjectSubmissions = submissions.filter(s => s.assignment);

            let avgMarks = 0;
            if (subjectSubmissions.length > 0) {
                const marks = subjectSubmissions.map(s => (s.marks / s.assignment.maxMarks) * 100);
                avgMarks = Math.round(marks.reduce((a, b) => a + b, 0) / marks.length);
            }

            // Calculate submission rate
            const totalStudents = await User.countDocuments({
                role: 'student',
                department: hodDepartment,
                semester: subject.semester,
                academicYear: subject.academicYear
            });

            const assignments = await Assignment.find({ subject: subject._id });
            let avgSubmissionRate = 0;
            if (assignments.length > 0 && totalStudents > 0) {
                const totalPossibleSubmissions = assignments.length * totalStudents;
                const actualSubmissions = await Submission.countDocuments({
                    assignment: { $in: assignments.map(a => a._id) }
                });
                avgSubmissionRate = Math.round((actualSubmissions / totalPossibleSubmissions) * 100);
            }

            // Calculate Real Attendance Avg
            const Attendance = require('../models/Attendance');
            const attendances = await Attendance.find({
                department: hodDepartment,
                semester: subject.semester,
                academicYear: subject.academicYear,
                subject: subject._id
            });

            let totalPresent = 0;
            let totalRecords = 0;

            attendances.forEach(att => {
                att.records.forEach(rec => {
                    totalRecords++;
                    if (rec.status === 'Present') totalPresent++;
                });
            });

            const attendanceAvg = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0;

            return {
                subjectName: subject.name,
                avgMarks,
                submissionRate: avgSubmissionRate,
                attendanceAvg
            };
        }));

        res.json(comparison);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Mentorship Oversight Stats
// @route   GET /api/analytics/hod/mentorship-oversight
// @access  Private/HOD
const getMentorshipOversight = async (req, res) => {
    try {
        const hodDepartment = req.user.department;

        // Group mentors and count mentees
        const mentoredStudents = await User.find({ role: 'student', department: hodDepartment, mentor: { $ne: null } })
            .populate({ path: 'mentor', select: 'username fullName' });

        // Group queries by mentor
        const queries = await MentorshipQuery.find({ department: hodDepartment });

        const mentorStats = {};

        // Aggregate mentee count
        for (const student of mentoredStudents) {
            if (!student.mentor) continue;
            const mId = student.mentor._id.toString();
            if (!mentorStats[mId]) {
                mentorStats[mId] = {
                    mentorName: student.mentor.fullName || student.mentor.username,
                    totalMentees: 0,
                    openQueries: 0,
                    criticalCases: 0,
                    totalResponseTimeMs: 0,
                    resolvedCount: 0
                };
            }
            mentorStats[mId].totalMentees++;
        }

        // Calculate Critical Cases per Mentor
        const StudentRisk = require('../models/StudentRisk');
        for (const mId in mentorStats) {
            mentorStats[mId].criticalCases = await StudentRisk.countDocuments({
                mentor: mId,
                riskLevel: 'Red'
            });
        }

        // Loop through queries to calculate Open count and Response Times
        queries.forEach(q => {
            const mId = q.mentor.toString();
            if (mentorStats[mId]) {
                if (q.status === 'Open') {
                    mentorStats[mId].openQueries++;
                } else if (q.status === 'Resolved' && q.resolvedAt && q.createdAt) {
                    const diff = new Date(q.resolvedAt) - new Date(q.createdAt);
                    if (diff > 0) {
                        mentorStats[mId].totalResponseTimeMs += diff;
                        mentorStats[mId].resolvedCount++;
                    }
                }
            }
        });

        const oversightData = Object.keys(mentorStats).map(key => {
            const stat = mentorStats[key];
            const avgResponseTimeMs = stat.resolvedCount > 0 ? stat.totalResponseTimeMs / stat.resolvedCount : 0;
            const avgResponseHours = (avgResponseTimeMs / (1000 * 60 * 60)).toFixed(1);
            return {
                mentorName: stat.mentorName,
                totalMentees: stat.totalMentees,
                openQueries: stat.openQueries,
                criticalCases: stat.criticalCases,
                avgResponseHours
            };
        });

        res.json(oversightData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get CCM Oversight Stats
// @route   GET /api/analytics/hod/ccm-oversight
// @access  Private/HOD
const getCCMOversight = async (req, res) => {
    try {
        const hodDepartment = req.user.department;

        const ccms = await CCM.find({ department: hodDepartment })
            .populate('createdBy', 'username fullName');

        let totalCCMs = ccms.length;
        let totalActionItems = 0;
        let totalOverdue = 0;

        ccms.forEach(ccm => {
            if (ccm.actionItems) {
                totalActionItems += ccm.actionItems.length;
                totalOverdue += ccm.actionItems.filter(a => a.status === 'Overdue' || (a.status === 'Pending' && new Date(a.targetDate || a.deadline) < new Date())).length;
            }
        });

        res.json({
            totalCCMs,
            totalActionItems,
            totalOverdue
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDepartmentPerformance,
    getSemesterTrends,
    getSubjectPerformance,
    getHODStats,
    getStaffPerformance,
    getStudentPerformance,
    getStaffWorkload,
    getAssignmentPerformanceComparison,
    getMentorshipOversight,
    getCCMOversight
};
