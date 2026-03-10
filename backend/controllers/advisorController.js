const ClassAdvisor = require('../models/ClassAdvisor');
const MentorshipNote = require('../models/MentorshipNote');
const User = require('../models/User');

// @desc    Assign a Class Advisor
// @route   POST /api/advisor/assign
// @access  Private/Admin/HOD
const assignClassAdvisor = async (req, res) => {
    try {
        const { academicYear, staffId } = req.body;

        let department = req.body.department;
        if (req.user.role === 'hod') {
            department = req.user.department;
        }

        // Verify Staff exists and belongs to department
        const staff = await User.findById(staffId);
        if (!staff || staff.role !== 'staff' || staff.department !== department) {
            return res.status(400).json({ message: 'Invalid staff selection. Must be staff from the same department.' });
        }

        // Check if assignment exists
        let assignment = await ClassAdvisor.findOne({ department, academicYear });

        if (assignment) {
            // Re-assign
            assignment.staff = staffId;
            assignment.assignedBy = req.user.id;
            assignment.createdAt = Date.now();
            await assignment.save();
        } else {
            // Create new
            assignment = await ClassAdvisor.create({
                department,
                academicYear,
                staff: staffId,
                assignedBy: req.user.id
            });
        }

        res.status(200).json(assignment);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Class advisor already exists for this year.' });
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Class Advisor assignments for a department
// @route   GET /api/advisor/assignments
// @access  Private/Admin/HOD
const getAssignments = async (req, res) => {
    try {
        let department = req.query.department;
        if (req.user.role === 'hod') {
            department = req.user.department;
        }

        const assignments = await ClassAdvisor.find(department ? { department } : {})
            .populate('staff', 'username fullName email')
            .populate('assignedBy', 'username');

        res.json(assignments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get class details if current user is an advisor
// @route   GET /api/advisor/my-class
// @access  Private/Staff
const getMyClass = async (req, res) => {
    try {
        const assignment = await ClassAdvisor.findOne({ staff: req.user.id });
        if (!assignment) {
            return res.status(404).json({ message: 'Not assigned as a Class Advisor' });
        }

        // Aggregate some basic stats
        const studentCount = await User.countDocuments({
            role: 'student',
            department: assignment.department,
            academicYear: assignment.academicYear,
            isActive: true
        });

        res.json({
            ...assignment.toObject(),
            studentCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get students for the advised class
// @route   GET /api/advisor/students
// @access  Private/Staff
const getAdvisedStudents = async (req, res) => {
    try {
        const assignment = await ClassAdvisor.findOne({ staff: req.user.id });
        if (!assignment) {
            return res.status(403).json({ message: 'Access Denied: Not a Class Advisor' });
        }

        // 1. Explicit students
        const explicitStudents = await User.find({ classAdvisor: req.user.id, role: 'student' }).select('-password');
        
        // 2. Dept/Year students
        const studentsByDeptYear = await User.find({
            role: 'student',
            department: assignment.department,
            academicYear: assignment.academicYear
        }).select('-password');

        // Combine
        const combined = [...new Map([...explicitStudents, ...studentsByDeptYear].map(s => [s._id.toString(), s])).values()];

        res.json(combined);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a mentorship note to a student
// @route   POST /api/advisor/student/:id/notes
// @access  Private/Staff
const addMentorshipNote = async (req, res) => {
    try {
        const studentId = req.params.id;
        const { noteType, content } = req.body;

        const assignment = await ClassAdvisor.findOne({ staff: req.user.id });
        if (!assignment) {
            return res.status(403).json({ message: 'Access Denied: Not a Class Advisor' });
        }

        // Verify student belongs to the advised class
        const student = await User.findOne({
            _id: studentId,
            role: 'student',
            department: assignment.department,
            academicYear: assignment.academicYear,
            isActive: true
        });

        if (!student) {
            return res.status(403).json({ message: 'Access Denied: Student not in your advised class' });
        }

        const note = await MentorshipNote.create({
            student: studentId,
            advisor: req.user.id,
            noteType,
            content
        });

        res.status(201).json(note);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get mentorship notes for a student
// @route   GET /api/advisor/student/:id/notes
// @access  Private/Staff/HOD/Admin
const getMentorshipNotes = async (req, res) => {
    try {
        const studentId = req.params.id;
        const student = await User.findById(studentId);

        if (!student) return res.status(404).json({ message: 'Student not found' });

        // Access Control
        if (req.user.role === 'staff') {
            const assignment = await ClassAdvisor.findOne({ staff: req.user.id });
            if (!assignment || assignment.department !== student.department || assignment.academicYear !== student.academicYear) {
                return res.status(403).json({ message: 'Access Denied' });
            }
        } else if (req.user.role === 'hod') {
            if (req.user.department !== student.department) {
                return res.status(403).json({ message: 'Access Denied' });
            }
        }

        const notes = await MentorshipNote.find({ student: studentId })
            .populate('advisor', 'username fullName')
            .sort({ createdAt: -1 });

        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get detailed class stats for the advisor dashboard
// @route   GET /api/advisor/my-class-stats
// @access  Private/Staff (Advisor only)
// @desc    Get detailed class stats for the advisor dashboard
const getMyClassStats = async (req, res) => {
    try {
        const assignment = await ClassAdvisor.findOne({ staff: req.user.id });
        if (!assignment) {
            return res.status(403).json({ message: 'Access Denied: Not a Class Advisor' });
        }

        const Submission = require('../models/Submission');
        const User = require('../models/User');

        // Dual Lookup logic
        const explicitStudentsForStats = await User.find({ classAdvisor: req.user.id, role: 'student' }).select('-password');
        const studentsByDeptYearForStats = await User.find({
            role: 'student',
            department: assignment.department,
            academicYear: assignment.academicYear
        }).select('-password');

        const students = [...new Map([...explicitStudentsForStats, ...studentsByDeptYearForStats].map(s => [s._id.toString(), s])).values()];

        const studentStats = await Promise.all(students.map(async (student) => {
            const submissions = await Submission.find({ student: student._id, status: 'graded' })
                .populate('assignment', 'maxMarks');

            let totalScore = 0;
            let totalMax = 0;
            submissions.forEach(sub => {
                if (sub.assignment) {
                    totalScore += sub.marks || 0;
                    totalMax += sub.assignment.maxMarks || 100;
                }
            });

            const avgScore = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : null;
            const atRisk = avgScore !== null && avgScore < 50;

            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const recentSub = await Submission.findOne({
                student: student._id,
                submittedAt: { $gte: thirtyDaysAgo }
            });
            const inactive = !recentSub && submissions.length === 0;

            return {
                _id: student._id,
                username: student.username,
                fullName: student.fullName,
                email: student.email,
                semester: student.semester,
                profileImage: student.profileImage,
                avgScore,
                submissionCount: submissions.length,
                atRisk: atRisk || inactive,
                inactive
            };
        }));

        const assignedCount = studentStats.filter(s => s.avgScore !== null).length;
        const overallAvg = assignedCount > 0
            ? Math.round(studentStats.filter(s => s.avgScore !== null).reduce((acc, s) => acc + s.avgScore, 0) / assignedCount)
            : null;
        const atRiskCount = studentStats.filter(s => s.atRisk).length;

        res.json({
            academicYear: assignment.academicYear,
            department: assignment.department,
            studentCount: students.length,
            avgScore: overallAvg,
            atRiskCount,
            students: studentStats
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Academic Insights for the advised class
const getAdvisorAcademicInsights = async (req, res) => {
    try {
        const assignment = await ClassAdvisor.findOne({ staff: req.user.id });
        if (!assignment) {
            return res.status(403).json({ message: 'Access Denied: Not a Class Advisor' });
        }

        const Subject = require('../models/Subject');
        const Submission = require('../models/Submission');
        const User = require('../models/User');

        const subjects = await Subject.find({
            department: assignment.department,
            academicYear: assignment.academicYear
        });

        const insights = await Promise.all(subjects.map(async (subject) => {
            const submissions = await Submission.find({ status: 'graded' })
                .populate({
                    path: 'assignment',
                    match: { subject: subject._id }
                });

            const subjectSubmissions = submissions.filter(s => s.assignment);

            if (subjectSubmissions.length === 0) {
                return {
                    _id: subject._id,
                    subjectCode: subject.subjectCode,
                    subjectName: subject.subjectName,
                    avgMarks: 0,
                    highest: 0,
                    lowest: 0,
                    submissionRate: 0
                };
            }

            const marks = subjectSubmissions.map(s => (s.marks / s.assignment.maxMarks) * 100);
            const avgMarks = Math.round(marks.reduce((a, b) => a + b, 0) / marks.length);

            return {
                _id: subject._id,
                subjectCode: subject.subjectCode,
                subjectName: subject.subjectName,
                avgMarks,
                highest: Math.round(Math.max(...marks)),
                lowest: Math.round(Math.min(...marks)),
                submissionRate: Math.round((subjectSubmissions.length / (await User.countDocuments({ role: 'student', department: assignment.department, academicYear: assignment.academicYear, isActive: true }))) * 100)
            };
        }));

        res.json(insights);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get detailed consolidated report data
const getConsolidatedReportData = async (req, res) => {
    try {
        let { department, academicYear, semester, section, reportType } = req.query;

        // If user is staff, verify they are a class advisor and restrict to their year/dept
        if (req.user.role === 'staff') {
            const assignment = await ClassAdvisor.findOne({ staff: req.user.id });
            if (!assignment) {
                return res.status(403).json({ message: 'Access Denied: Not a Class Advisor' });
            }
            // Override with advisor's assigned values to prevent viewing other years/depts
            department = assignment.department;
            academicYear = assignment.academicYear;
        } else if (req.user.role === 'hod') {
            // HOD is restricted to their department
            department = req.user.department;
        }

        // Find students in the class
        const query = { role: 'student', isActive: true };
        if (department) query.department = department;
        if (academicYear) query.academicYear = academicYear;
        if (semester) query.semester = semester;
        if (section) query.section = section;

        const students = await User.find(query).select('fullName registerNumber department semester section academicYear');

        const Subject = require('../models/Subject');
        const subjects = await Subject.find({
            department,
            academicYear,
            semester: semester
        }).select('name code');

        const InternalMark = require('../models/InternalMark');
        const Attendance = require('../models/Attendance');

        const reportData = await Promise.all(students.map(async (student) => {
            const dataRow = {
                rollNo: student.registerNumber,
                studentName: student.fullName,
            };

            if (reportType === 'internal' || !reportType) {
                const studentMarks = await InternalMark.find({
                    student: student._id,
                    academicYear: student.academicYear,
                    semester: student.semester
                }).populate('subject', 'name');

                let totalObtained = 0;
                const subjectMarkData = {};

                subjects.forEach(sub => {
                    const mark = studentMarks.find(m => m.subject._id.toString() === sub._id.toString());
                    const cia1 = mark ? (mark.cia1 || 0) : 0;
                    const cia2 = mark ? (mark.cia2 || 0) : 0;
                    subjectMarkData[sub.code] = { cia1, cia2 };
                    totalObtained += cia1 + cia2;
                });

                const average = subjects.length > 0 ? (totalObtained / (subjects.length * 2)) : 0;
                dataRow.subjects = subjectMarkData;
                dataRow.total = totalObtained;
                dataRow.average = average.toFixed(2);
            }

            if (reportType === 'attendance' || !reportType) {
                const attendanceQuery = { 'records.student': student._id };
                if (req.query.month) {
                    const [yearPart, monthPart] = req.query.month.split('-');
                    const startDate = new Date(yearPart, monthPart - 1, 1);
                    const endDate = new Date(yearPart, monthPart, 0);
                    attendanceQuery.date = { $gte: startDate, $lte: endDate };
                }

                const attendances = await Attendance.find(attendanceQuery);
                let presentCount = 0;
                let totalCount = 0;
                attendances.forEach(att => {
                    const rec = att.records.find(r => r.student.toString() === student._id.toString());
                    if (rec) {
                        totalCount++;
                        if (rec.status === 'Present') presentCount++;
                    }
                });
                dataRow.attendance = totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(2) : "0.00";
                dataRow.totalWorkingDays = totalCount;
                dataRow.presentDays = presentCount;
            }

            // Risk Calculation logic
            let risk = 'LOW';
            let color = 'Green';
            const avgVal = parseFloat(dataRow.average || 0);
            const attVal = parseFloat(dataRow.attendance || 0);

            if (avgVal < 10 || attVal < 75) {
                risk = 'HIGH';
                color = 'Red';
            } else if (avgVal < 15 || attVal < 85) {
                risk = 'MEDIUM';
                color = 'Yellow';
            }
            dataRow.risk = risk;
            dataRow.color = color;

            return dataRow;
        }));

        res.json({
            header: {
                title: 'AAES – AI Powered Academic Evaluation System',
                subtitle: reportType === 'attendance' ? 'Monthly Attendance Report' : (reportType === 'internal' ? 'Internal Assessment Report' : 'Consolidated Academic Report'),
                department,
                year: academicYear,
                section,
                semester,
                reportType
            },
            subjects: subjects.map(s => ({ name: s.name, code: s.code })),
            data: reportData
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get chronological timeline of student activities
const getStudentTimeline = async (req, res) => {
    try {
        const studentId = req.params.id;
        const student = await User.findById(studentId);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        // Access Control
        if (req.user.role === 'staff') {
            const assignment = await ClassAdvisor.findOne({ staff: req.user.id });
            if (!assignment || assignment.department !== student.department || assignment.academicYear !== student.academicYear) {
                return res.status(403).json({ message: 'Access Denied: Not your class' });
            }
        } else if (req.user.role === 'hod') {
            if (req.user.department !== student.department) {
                return res.status(403).json({ message: 'Access Denied: Department mismatch' });
            }
        }

        const Submission = require('../models/Submission');
        const Attendance = require('../models/Attendance');
        const MentorshipNote = require('../models/MentorshipNote');

        // Fetch all activities
        const [submissions, notes, attendance] = await Promise.all([
            Submission.find({ student: studentId }).populate('assignment', 'title type maxMarks'),
            MentorshipNote.find({ student: studentId }).populate('advisor', 'username fullName'),
            Attendance.find({ 'students.student': studentId })
        ]);

        // Transform into timeline events
        const events = [];

        // Submission Events
        submissions.forEach(sub => {
            events.push({
                type: 'submission',
                date: sub.submittedAt || sub.createdAt,
                title: sub.assignment ? sub.assignment.title : 'Deleted Assignment',
                category: sub.assignment ? sub.assignment.type : 'N/A',
                status: sub.status,
                marks: sub.marks,
                maxMarks: sub.assignment ? sub.assignment.maxMarks : 100,
                feedback: sub.feedback
            });
        });

        // Mentorship Events
        notes.forEach(note => {
            events.push({
                type: 'mentorship',
                date: note.createdAt,
                title: note.noteType,
                content: note.content,
                advisor: note.advisor ? (note.advisor.fullName || note.advisor.username) : 'System'
            });
        });

        // Attendance Events (Brief summary or grouped by week in future, but for now individual records)
        // Grouping attendance to avoid overwhelming the timeline
        const recentAttendance = attendance.sort((a, b) => b.date - a.date).slice(0, 5);
        recentAttendance.forEach(record => {
            const studentRecord = record.students.find(s => s.student.toString() === studentId);
            events.push({
                type: 'attendance',
                date: record.date,
                title: 'Attendance Recorded',
                status: studentRecord ? studentRecord.status : 'N/A',
                subjectId: record.subject
            });
        });

        // Sort by date descending
        events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all mentorship notes for the class
const getAllClassNotes = async (req, res) => {
    try {
        const assignment = await ClassAdvisor.findOne({ staff: req.user.id });
        if (!assignment) {
            return res.status(403).json({ message: 'Access Denied: Not a Class Advisor' });
        }

        const students = await User.find({
            role: 'student',
            department: assignment.department,
            academicYear: assignment.academicYear,
            isActive: true
        }).select('_id');

        const studentIds = students.map(s => s._id);

        const notes = await MentorshipNote.find({ student: { $in: studentIds } })
            .populate('student', 'fullName username registerNumber')
            .populate('advisor', 'username fullName')
            .sort({ createdAt: -1 });

        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update student register number
const updateStudentRegisterNumber = async (req, res) => {
    try {
        const studentId = req.params.id;
        const { registerNumber } = req.body;

        if (!registerNumber) {
            return res.status(400).json({ message: 'Register number is required' });
        }

        const student = await User.findById(studentId);
        if (!student || student.role !== 'student') {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Access Control: Must be the Class Advisor for this student's year/dept
        const assignment = await ClassAdvisor.findOne({ 
            staff: req.user.id,
            department: student.department,
            academicYear: student.academicYear
        });

        if (!assignment) {
            return res.status(403).json({ message: 'Access Denied: You are not authorized to update this student information' });
        }

        student.registerNumber = registerNumber;
        await student.save();

        res.json({ message: 'Register number updated successfully', registerNumber: student.registerNumber });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    assignClassAdvisor,
    getAssignments,
    getMyClass,
    getAdvisedStudents,
    addMentorshipNote,
    getMentorshipNotes,
    getAllClassNotes,
    getMyClassStats,
    getAdvisorAcademicInsights,
    getConsolidatedReportData,
    getStudentTimeline,
    updateStudentRegisterNumber
};

