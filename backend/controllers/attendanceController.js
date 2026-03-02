const Attendance = require('../models/Attendance');
const Subject = require('../models/Subject');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const logFile = path.join(__dirname, '../attendance_debug.log');
const ClassAdvisor = require('../models/ClassAdvisor');
const { recalculateRiskForStudent } = require('../services/riskEngine');


// Helper: check if a session is currently locked (now locked immediately upon creation)
const isLocked = (attendance) => !!attendance.lockedAt;

// Helper: verify staff is assigned to a subject
const verifyStaffSubject = async (subjectId, staffId) => {
    const subject = await Subject.findById(subjectId);
    if (!subject) return { error: 'Subject not found', code: 404 };
    if (!subject.staff.map(s => s.toString()).includes(staffId.toString())) {
        return { error: 'Access Denied: You are not assigned to this subject', code: 403 };
    }
    return { subject };
};

// @desc    Mark attendance for a subject session
// @route   POST /api/attendance
// @access  Private/Staff
const markAttendance = async (req, res) => {
    try {
        const { subjectId, date, period, records } = req.body;
        // records = [{ studentId, status }]

        const check = await verifyStaffSubject(subjectId, req.user.id);
        if (check.error) return res.status(check.code).json({ message: check.error });

        const subject = check.subject;
        const sessionDate = new Date(date);
        sessionDate.setHours(0, 0, 0, 0);

        // Check for existing session
        let attendance = await Attendance.findOne({ subject: subjectId, date: sessionDate, period });

        if (attendance) {
            if (isLocked(attendance)) {
                return res.status(403).json({ message: 'Attendance is locked after 24 hours and cannot be edited.' });
            }
            // Update existing
            attendance.records = records.map(r => ({ student: r.studentId, status: r.status }));
            attendance.markedBy = req.user.id;
            await attendance.save();

            // Trigger Risk Recalculation for all students in this session
            records.forEach(r => {
                recalculateRiskForStudent(r.studentId);
            });

            return res.json({ message: 'Attendance updated', attendance });

        }

        // Create new attendance session
        attendance = await Attendance.create({
            subject: subjectId,
            date: sessionDate,
            period,
            markedBy: req.user.id,
            records: records.map(r => ({ student: r.studentId, status: r.status }))
        });

        // Trigger Risk Recalculation for all students in this session
        records.forEach(r => {
            recalculateRiskForStudent(r.studentId);
        });

        res.status(201).json({ message: 'Attendance saved', attendance });


    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Attendance already exists for this period. Try editing instead.' });
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get attendance for a specific session
// @route   GET /api/attendance/session?subjectId=&date=&period=
// @access  Private/Staff/Advisor/HOD
const getSessionAttendance = async (req, res) => {
    try {
        const { subjectId, date, period } = req.query;
        const sessionDate = new Date(date);
        sessionDate.setHours(0, 0, 0, 0);

        const attendance = await Attendance.findOne({ subject: subjectId, date: sessionDate, period })
            .populate('records.student', 'username fullName registerNumber');

        if (!attendance) return res.json(null);

        // Access control
        if (req.user.role === 'staff') {
            const check = await verifyStaffSubject(subjectId, req.user.id);
            // Also allow advisor staff to view
            if (check.error) {
                const advisor = await ClassAdvisor.findOne({ staff: req.user.id });
                if (!advisor) return res.status(check.code).json({ message: check.error });
            }
        } else if (req.user.role === 'hod') {
            const subject = await Subject.findById(subjectId);
            if (subject.department !== req.user.department) {
                return res.status(403).json({ message: 'Access Denied' });
            }
        }

        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get subject attendance summary (student-wise %)
// @route   GET /api/attendance/subject/:id/summary
// @access  Private/Staff(own subjects)/Advisor/HOD
const getSubjectSummary = async (req, res) => {
    try {
        const subjectId = req.params.id;
        const subject = await Subject.findById(subjectId).populate('staff', 'username fullName');
        if (!subject) return res.status(404).json({ message: 'Subject not found' });

        // Access control
        if (req.user.role === 'staff') {
            const isAssigned = subject.staff.map(s => s._id.toString()).includes(req.user.id.toString());
            if (!isAssigned) {
                // Allow if advisor for that dept/year
                const advisor = await ClassAdvisor.findOne({ staff: req.user.id });
                if (!advisor || advisor.department !== subject.department || advisor.academicYear !== subject.academicYear) {
                    return res.status(403).json({ message: 'Access Denied: Not assigned to this subject' });
                }
            }
        } else if (req.user.role === 'hod') {
            if (subject.department !== req.user.department) {
                return res.status(403).json({ message: 'Access Denied' });
            }
        }

        // Get all attendance sessions for this subject
        const sessions = await Attendance.find({ subject: subjectId })
            .sort({ date: -1 });

        const totalClasses = sessions.length;

        // Get students enrolled in this subject's dept/semester/academicYear
        const students = await User.find({
            role: 'student',
            department: subject.department,
            semester: subject.semester,
            academicYear: subject.academicYear
        }).select('username fullName registerNumber email');

        // Calculate per-student attendance
        const studentStats = students.map(student => {
            let present = 0;
            let absent = 0;
            sessions.forEach(session => {
                const record = session.records.find(r => r.student.toString() === student._id.toString());
                if (record) {
                    if (record.status === 'Present') present++;
                    else absent++;
                }
            });
            const percentage = totalClasses > 0 ? Math.round((present / totalClasses) * 100) : null;
            const risk = percentage === null ? 'no-data' : percentage < 75 ? 'high' : percentage < 85 ? 'moderate' : 'good';
            return {
                _id: student._id,
                username: student.username,
                fullName: student.fullName,
                registerNumber: student.registerNumber,
                email: student.email,
                present,
                absent,
                totalClasses,
                percentage,
                risk
            };
        });

        const attendedCount = studentStats.filter(s => s.percentage !== null).length;
        const avgAttendance = attendedCount > 0
            ? Math.round(studentStats.filter(s => s.percentage !== null).reduce((a, s) => a + s.percentage, 0) / attendedCount)
            : null;

        res.json({
            subject: { _id: subject._id, name: subject.name, code: subject.code, staff: subject.staff },
            totalClasses,
            avgAttendance,
            students: studentStats,
            sessions: sessions.map(s => ({ _id: s._id, date: s.date, period: s.period, locked: isLocked(s) }))
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get advisor-level year attendance view
// @route   GET /api/attendance/advisor
// @access  Private/Staff (advisors only)
const getAdvisorView = async (req, res) => {
    try {
        const advisor = await ClassAdvisor.findOne({ staff: req.user.id });
        if (!advisor) return res.status(403).json({ message: 'Access Denied: Not a Class Advisor' });

        // Get all subjects for this year and dept
        const subjects = await Subject.find({
            department: advisor.department,
            academicYear: advisor.academicYear
        }).populate('staff', 'username fullName');

        // For each subject, get summary stats
        const subjectStats = await Promise.all(subjects.map(async (subject) => {
            const sessions = await Attendance.find({ subject: subject._id });
            const totalClasses = sessions.length;

            // Get enrolled students
            const students = await User.find({
                role: 'student',
                department: subject.department,
                semester: subject.semester,
                academicYear: subject.academicYear
            }).select('_id');

            let totalPresent = 0;
            let totalSlots = 0;
            students.forEach(student => {
                sessions.forEach(session => {
                    const record = session.records.find(r => r.student.toString() === student._id.toString());
                    if (record) {
                        totalSlots++;
                        if (record.status === 'Present') totalPresent++;
                    }
                });
            });

            const avgAttendance = totalSlots > 0 ? Math.round((totalPresent / totalSlots) * 100) : null;

            return {
                _id: subject._id,
                name: subject.name,
                code: subject.code,
                semester: subject.semester,
                staff: subject.staff,
                totalClasses,
                avgAttendance
            };
        }));

        // Get student-wise overall attendance across all subjects
        const students = await User.find({
            role: 'student',
            department: advisor.department,
            academicYear: advisor.academicYear
        }).select('username fullName registerNumber email semester');

        const allSessions = await Attendance.find({
            subject: { $in: subjects.map(s => s._id) }
        });

        const studentOverall = students.map(student => {
            let present = 0;
            let total = 0;
            allSessions.forEach(session => {
                const record = session.records.find(r => r.student.toString() === student._id.toString());
                if (record) {
                    total++;
                    if (record.status === 'Present') present++;
                }
            });
            const percentage = total > 0 ? Math.round((present / total) * 100) : null;
            const risk = percentage === null ? 'no-data' : percentage < 75 ? 'high' : percentage < 85 ? 'moderate' : 'good';
            return {
                _id: student._id,
                username: student.username,
                fullName: student.fullName,
                registerNumber: student.registerNumber,
                email: student.email,
                semester: student.semester,
                present,
                total,
                percentage,
                risk
            };
        });

        res.json({
            academicYear: advisor.academicYear,
            department: advisor.department,
            subjects: subjectStats,
            students: studentOverall
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get HOD-level department attendance view
// @route   GET /api/attendance/hod?year=
// @access  Private/HOD
const getHODView = async (req, res) => {
    try {
        const { year } = req.query;
        const query = { department: req.user.department };
        if (year) query.academicYear = year;

        const subjects = await Subject.find(query).populate('staff', 'username fullName');

        const subjectStats = await Promise.all(subjects.map(async (subject) => {
            const sessions = await Attendance.find({ subject: subject._id });
            const totalClasses = sessions.length;

            const students = await User.find({
                role: 'student',
                department: subject.department,
                semester: subject.semester,
                academicYear: subject.academicYear
            }).select('_id');

            let totalPresent = 0;
            let totalSlots = 0;
            students.forEach(student => {
                sessions.forEach(session => {
                    const record = session.records.find(r => r.student.toString() === student._id.toString());
                    if (record) {
                        totalSlots++;
                        if (record.status === 'Present') totalPresent++;
                    }
                });
            });

            const avgAttendance = totalSlots > 0 ? Math.round((totalPresent / totalSlots) * 100) : null;
            return {
                _id: subject._id,
                name: subject.name,
                code: subject.code,
                academicYear: subject.academicYear,
                semester: subject.semester,
                staff: subject.staff,
                totalClasses,
                avgAttendance,
                studentCount: students.length
            };
        }));

        // Staff performance comparison
        const staffMap = {};
        subjectStats.forEach(s => {
            s.staff.forEach(st => {
                const id = st._id.toString();
                if (!staffMap[id]) staffMap[id] = { name: st.fullName || st.username, subjects: [], total: 0, count: 0 };
                if (s.avgAttendance !== null) {
                    staffMap[id].total += s.avgAttendance;
                    staffMap[id].count++;
                }
                staffMap[id].subjects.push(s.name);
            });
        });

        const staffStats = Object.entries(staffMap).map(([id, data]) => ({
            _id: id,
            name: data.name,
            avgAttendance: data.count > 0 ? Math.round(data.total / data.count) : null,
            subjectCount: data.subjects.length,
            subjects: data.subjects
        }));

        res.json({ subjects: subjectStats, staffStats, department: req.user.department });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get students for a subject (for attendance entry)
// @route   GET /api/attendance/subject/:id/students
// @access  Private/Staff (assigned or advisor) / HOD
const getStudentsForSubject = async (req, res) => {
    try {
        const subjectId = req.params.id;
        const subject = await Subject.findById(subjectId);
        if (!subject) return res.status(404).json({ message: 'Subject not found' });

        // Access control
        if (req.user.role === 'staff') {
            const isAssigned = subject.staff.map(s => s.toString()).includes(req.user.id.toString());
            if (!isAssigned) {
                const advisor = await ClassAdvisor.findOne({ staff: req.user.id });
                if (!advisor || advisor.department !== subject.department || advisor.academicYear !== subject.academicYear) {
                    return res.status(403).json({ message: 'Access Denied' });
                }
            }
        } else if (req.user.role === 'hod') {
            if (subject.department !== req.user.department) {
                return res.status(403).json({ message: 'Access Denied' });
            }
        }

        const students = await User.find({
            role: 'student',
            department: subject.department,
            semester: subject.semester,
            isActive: true
        }).select('username fullName registerNumber email');

        res.json({
            subject: { _id: subject._id, name: subject.name, code: subject.code, department: subject.department, semester: subject.semester, academicYear: subject.academicYear },
            students
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my attendance (student view)
// @route   GET /api/attendance/my
// @access  Private/Student
const getMyAttendance = async (req, res) => {
    try {
        const studentId = req.user.id;
        const debugInfo = {
            timestamp: new Date().toISOString(),
            user: {
                id: studentId,
                username: req.user.username,
                dept: req.user.department,
                year: req.user.academicYear,
                sem: req.user.semester
            }
        };

        // Find all subjects for this student
        const subjects = await Subject.find({
            department: req.user.department,
            academicYear: req.user.academicYear,
            semester: req.user.semester
        });

        debugInfo.subjectsFound = subjects.length;
        debugInfo.query = {
            department: req.user.department,
            academicYear: req.user.academicYear,
            semester: req.user.semester
        };

        fs.appendFileSync(logFile, JSON.stringify(debugInfo, null, 2) + '\n---\n');

        const subjectIds = subjects.map(s => s._id);

        // Get all sessions for these subjects
        const sessions = await Attendance.find({
            subject: { $in: subjectIds }
        }).populate('subject', 'name code');

        // Group sessions by subject and calculate stats
        const subjectStats = subjects.map(subject => {
            const subjectSessions = sessions.filter(s => s.subject._id.toString() === subject._id.toString());
            let present = 0;
            let total = 0;

            subjectSessions.forEach(session => {
                const record = session.records.find(r => r.student.toString() === studentId.toString());
                if (record) {
                    total++;
                    if (record.status === 'Present') present++;
                }
            });

            const percentage = total > 0 ? Math.round((present / total) * 100) : null;
            return {
                subjectId: subject._id,
                name: subject.name,
                code: subject.code,
                present,
                total,
                percentage
            };
        });

        res.json({
            stats: subjectStats,
            debug: {
                studentId,
                criteria: {
                    department: req.user.department,
                    academicYear: req.user.academicYear,
                    semester: req.user.semester
                },
                subjectCount: subjects.length,
                sessionCount: sessions.length
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get students below 75% attendance threshold (Alerts)
// @route   GET /api/attendance/alerts
// @access  Private/Staff(Advisor)/HOD
const getAttendanceAlerts = async (req, res) => {
    try {
        let department, academicYear;

        if (req.user.role === 'hod') {
            department = req.user.department;
            academicYear = req.query.year || new Date().getFullYear() + '-' + (new Date().getFullYear() + 1);
        } else {
            const advisor = await ClassAdvisor.findOne({ staff: req.user.id });
            if (!advisor) return res.status(403).json({ message: 'Access Denied: Not a Class Advisor' });
            department = advisor.department;
            academicYear = advisor.academicYear;
        }

        const subjects = await Subject.find({ department, academicYear });
        const allSessions = await Attendance.find({ subject: { $in: subjects.map(s => s._id) } });

        const students = await User.find({
            role: 'student',
            department,
            academicYear,
            isActive: true
        }).select('username fullName registerNumber email semester');

        const THRESHOLD = 75;
        const alerts = [];

        students.forEach(student => {
            let present = 0;
            let total = 0;
            allSessions.forEach(session => {
                const record = session.records.find(r => r.student.toString() === student._id.toString());
                if (record) {
                    total++;
                    if (record.status === 'Present') present++;
                }
            });

            if (total > 0) {
                const percentage = Math.round((present / total) * 100);
                if (percentage < THRESHOLD) {
                    const classesNeeded = Math.ceil((THRESHOLD * total - present * 100) / (100 - THRESHOLD));
                    alerts.push({
                        studentId: student._id,
                        name: student.fullName || student.username,
                        registerNumber: student.registerNumber,
                        email: student.email,
                        semester: student.semester,
                        present,
                        total,
                        percentage,
                        classesNeeded: Math.max(0, classesNeeded),
                        risk: percentage < 60 ? 'critical' : 'warning'
                    });
                }
            }
        });

        alerts.sort((a, b) => a.percentage - b.percentage);

        res.json({
            threshold: THRESHOLD,
            totalAlerts: alerts.length,
            department,
            academicYear,
            alerts
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get monthly attendance heatmap data for advisor view
// @route   GET /api/attendance/heatmap?subjectId=
// @access  Private/Staff(Advisor)/HOD
const getAttendanceHeatmap = async (req, res) => {
    try {
        const { subjectId } = req.query;
        if (!subjectId) return res.status(400).json({ message: 'subjectId is required' });

        const sessions = await Attendance.find({ subject: subjectId }).sort({ date: 1 });

        // Group by month
        const monthMap = {};
        sessions.forEach(session => {
            const d = new Date(session.date);
            const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            if (!monthMap[monthKey]) monthMap[monthKey] = { sessions: 0, presentTotal: 0, total: 0 };
            monthMap[monthKey].sessions++;
            session.records.forEach(r => {
                monthMap[monthKey].total++;
                if (r.status === 'Present') monthMap[monthKey].presentTotal++;
            });
        });

        const heatmap = Object.entries(monthMap).map(([month, data]) => ({
            month,
            sessions: data.sessions,
            avgAttendance: data.total > 0 ? Math.round((data.presentTotal / data.total) * 100) : 0
        }));

        res.json({ subjectId, heatmap });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    markAttendance,
    getSessionAttendance,
    getSubjectSummary,
    getAdvisorView,
    getHODView,
    getStudentsForSubject,
    getMyAttendance,
    getAttendanceAlerts,
    getAttendanceHeatmap
};
