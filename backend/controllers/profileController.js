const User = require('../models/User');
const Subject = require('../models/Subject');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');

// Helper function to calculate role-specific stats
const calculateUserStats = async (user) => {
    let stats = {};

    if (user.role === 'student') {
        const submissions = await Submission.find({ student: user._id })
            .populate({
                path: 'assignment',
                select: 'title maxMarks subject',
                populate: { path: 'subject', select: 'name code' }
            });

        // Group by Subject
        const subjectPerformance = {};
        submissions.forEach(sub => {
            if (!sub.assignment || !sub.assignment.subject) return;
            const subjName = sub.assignment.subject.name;

            if (!subjectPerformance[subjName]) {
                subjectPerformance[subjName] = {
                    totalMarks: 0,
                    maxMarks: 0,
                    assignmentCount: 0,
                    code: sub.assignment.subject.code
                };
            }

            if (sub.status === 'graded' || sub.marks > 0) {
                subjectPerformance[subjName].totalMarks += sub.marks || 0;
                subjectPerformance[subjName].maxMarks += sub.assignment.maxMarks || 100;
                subjectPerformance[subjName].assignmentCount++;
            }
        });

        const subjects = Object.keys(subjectPerformance).map(name => ({
            name,
            code: subjectPerformance[name].code,
            average: subjectPerformance[name].maxMarks > 0
                ? Math.round((subjectPerformance[name].totalMarks / subjectPerformance[name].maxMarks) * 100)
                : 0,
            assignments: subjectPerformance[name].assignmentCount
        }));

        const evaluated = submissions.filter(s => s.status === 'graded' || s.marks > 0);
        const pending = submissions.filter(s => s.status !== 'graded' && s.marks === 0);

        stats = {
            academicSummary: {
                totalSubmitted: submissions.length,
                evaluated: evaluated.length,
                pending: pending.length,
                overallAverage: subjects.reduce((acc, curr) => acc + curr.average, 0) / (subjects.length || 1)
            },
            subjectPerformance: subjects,
            recentActivity: submissions.slice(0, 5).map(s => ({
                assignment: s.assignment?.title,
                status: s.status,
                marks: s.marks,
                date: s.submittedAt
            }))
        };

    } else if (user.role === 'staff') {
        const subjects = await Subject.find({ staff: user._id });
        const assignmentsCreated = await Assignment.countDocuments({ createdBy: user._id });

        const myAssignments = await Assignment.find({ createdBy: user._id }).select('_id');
        const myAssignmentIds = myAssignments.map(a => a._id);

        const totalSubmissions = await Submission.countDocuments({ assignment: { $in: myAssignmentIds } });
        const evaluatedSubmissions = await Submission.countDocuments({
            assignment: { $in: myAssignmentIds },
            status: 'graded'
        });

        stats = {
            teachingOverview: {
                subjectsCount: subjects.length,
                totalStudents: subjects.length * 60,
                assignmentsCreated
            },
            evaluationStats: {
                totalSubmissionsReceived: totalSubmissions,
                evaluated: evaluatedSubmissions,
                pending: totalSubmissions - evaluatedSubmissions,
                completionRate: totalSubmissions > 0 ? Math.round((evaluatedSubmissions / totalSubmissions) * 100) : 0
            },
            subjectsList: subjects.map(s => ({
                name: s.name,
                code: s.code,
                semester: s.semester,
                academicYear: s.academicYear || s.get?.('academicYear') || 'Not Specified'
            }))
        };

    } else if (user.role === 'hod') {
        const staffCount = await User.countDocuments({ role: 'staff', department: user.department });
        const studentCount = await User.countDocuments({ role: 'student', department: user.department });
        const subjectCount = await require('../models/Subject').countDocuments({ department: user.department });

        stats = {
            deptIntelligence: {
                totalStaff: staffCount,
                totalStudents: studentCount,
                activeSubjects: subjectCount,
                averageAttendance: '85%'
            },
            studentDistribution: {
                year1: await User.countDocuments({ role: 'student', department: user.department, academicYear: '1st Year' }),
                year2: await User.countDocuments({ role: 'student', department: user.department, academicYear: '2nd Year' }),
                year3: await User.countDocuments({ role: 'student', department: user.department, academicYear: '3rd Year' }),
                year4: await User.countDocuments({ role: 'student', department: user.department, academicYear: '4th Year' })
            }
        };
    } else if (user.role === 'admin') {
        stats = {
            globalStats: {
                totalUsers: await User.countDocuments(),
                totalDepts: await require('../models/Department').countDocuments(),
                totalSubjects: await require('../models/Subject').countDocuments(),
                totalAssignments: await Assignment.countDocuments()
            },
            governance: {
                activeUsers: await User.countDocuments({ isActive: true }),
                inactiveUsers: await User.countDocuments({ isActive: false }),
                recentLogins: 15
            }
        };
    }

    return stats;
};

// @desc    Get current user profile
// @route   GET /api/profile/me
// @access  Private
const getMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const stats = await calculateUserStats(user);
        res.json({ ...user.toObject(), stats });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update current user profile
// @route   PUT /api/profile/me
// @access  Private
const updateMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Allow updating only specific fields
        if (req.body.phone) user.phone = req.body.phone;
        if (req.body.fullName) user.fullName = req.body.fullName; // Allow correcting name
        if (req.body.bloodGroup) user.bloodGroup = req.body.bloodGroup;
        if (req.body.schooling) user.schooling = req.body.schooling;
        if (req.body.currentCgpa) user.currentCgpa = req.body.currentCgpa;
        if (req.body.historyOfArrears) user.historyOfArrears = req.body.historyOfArrears;

        // Handle profile image upload
        if (req.file) {
            user.profileImage = `/uploads/profiles/${req.file.filename}`;
        } else if (req.body.profileImage) {
            user.profileImage = req.body.profileImage;
        }

        // Restrict changing core academic data
        // user.role, user.department, etc. are NOT updated here

        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            role: updatedUser.role,
            fullName: updatedUser.fullName,
            phone: updatedUser.phone,
            bloodGroup: updatedUser.bloodGroup,
            schooling: updatedUser.schooling,
            currentCgpa: updatedUser.currentCgpa,
            historyOfArrears: updatedUser.historyOfArrears,
            profileImage: updatedUser.profileImage,
            department: updatedUser.department
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get specific user profile (for HOD/Admin)
// @route   GET /api/profile/user/:id
// @access  Private (HOD/Admin)
const getUserProfile = async (req, res) => {
    try {
        const targetUser = await User.findById(req.params.id).select('-password');
        if (!targetUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Access Control
        if (req.user.role !== 'admin') {
            if (req.user.role === 'hod') {
                // HOD can only view users in their department
                if (targetUser.department !== req.user.department) {
                    return res.status(403).json({ message: 'Access Denied: Not in your department' });
                }
            } else if (req.user.role === 'staff') {
                // Staff can only view student profiles mapped to them
                if (targetUser.role !== 'student') {
                    // Quick optimization logic for staff viewing other staff:
                    // Staff Must NOT: View other staff profiles
                    return res.status(403).json({ message: 'Staff can only view student profiles' });
                }

                const Subject = require('../models/Subject');
                const assignedSubjects = await Subject.find({ staff: req.user.id });

                const isMapped = assignedSubjects.some(sub =>
                    sub.department === targetUser.department &&
                    sub.semester === targetUser.semester &&
                    sub.academicYear === targetUser.academicYear
                );

                if (!isMapped) {
                    return res.status(403).json({ message: 'Access Denied: Student not enrolled in your subjects' });
                }
            } else {
                // Student cannot view arbitrary profiles via this endpoint
                return res.status(403).json({ message: 'Access Denied' });
            }
        }

        const stats = await calculateUserStats(targetUser);
        res.json({ ...targetUser.toObject(), stats });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Department Staff (HOD)
// @route   GET /api/profile/dept/staff
// @access  Private (HOD)
const getDepartmentStaff = async (req, res) => {
    try {
        if (req.user.role !== 'hod') {
            return res.status(403).json({ message: 'Access Denied' });
        }

        const staff = await User.find({ role: 'staff', department: req.user.department })
            .select('-password');

        res.json(staff);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Department Students (HOD)
// @route   GET /api/profile/dept/students
// @access  Private (HOD)
const getDepartmentStudents = async (req, res) => {
    try {
        if (req.user.role !== 'hod') {
            return res.status(403).json({ message: 'Access Denied' });
        }

        const students = await User.find({ role: 'student', department: req.user.department })
            .select('-password');

        res.json(students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getMyProfile,
    updateMyProfile,
    getUserProfile,
    getDepartmentStaff,
    getDepartmentStudents
};
