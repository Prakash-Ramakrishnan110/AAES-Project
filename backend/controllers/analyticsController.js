const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const User = require('../models/User');
const Subject = require('../models/Subject');

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

// @desc    Get HOD specific stats
// @route   GET /api/analytics/hod/stats
// @access  Private/HOD
const getHODStats = async (req, res) => {
    try {
        const department = req.user.department;

        if (!department) {
            return res.status(400).json({ message: 'User does not have a department assigned' });
        }

        // 1. Counts
        const staffCount = await User.countDocuments({ role: 'staff', department });
        const studentCount = await User.countDocuments({ role: 'student', department });

        // 2. Avg Performance (Aggregated from Submissions -> Student.department)
        const perfStats = await Submission.aggregate([
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
                $match: {
                    'studentInfo.department': department,
                    status: 'graded'
                }
            },
            {
                $group: {
                    _id: null,
                    avgMarks: { $avg: '$marks' }
                }
            }
        ]);

        const avgMarks = perfStats.length > 0 ? Math.round(perfStats[0].avgMarks * 10) / 10 : 0;

        res.json({
            staffCount,
            studentCount,
            avgMarks
        });

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

        res.json({
            staffCount,
            studentCount,
            avgMarks: Math.round(avgMarks * 10) / 10
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDepartmentPerformance,
    getSemesterTrends, // Kept original name as getSemesterTrends function is not removed
    getSubjectPerformance,
    getHODStats
};
