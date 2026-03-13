const mongoose = require('mongoose');
const User = require('../models/User');
const MentorStudentMap = require('../models/MentorStudentMap');
const ClassAdvisor = require('../models/ClassAdvisor');
const MentorshipInteraction = require('../models/MentorshipInteraction');
const Escalation = require('../models/Escalation');
const Attendance = require('../models/Attendance');
const Submission = require('../models/Submission');
const Subject = require('../models/Subject');

const StudentRisk = require('../models/StudentRisk');
const InternalMark = require('../models/InternalMark');

/**
 * Get student risk logic from cache.
 * If not in cache, trigger a recalculation (non-blocking) and return defaults.
 */
const getCachedRiskLevel = async (studentId) => {
    let riskData = await StudentRisk.findOne({ student: studentId }).sort({ lastCalculatedAt: -1 });

    if (!riskData) {
        const { recalculateRiskForStudent } = require('../services/riskEngine');
        recalculateRiskForStudent(studentId); // trigger for next time
        return {
            attendancePercentage: 100,
            internalPercentage: 100,
            assignmentPercentage: 100,
            riskLevel: 'Green',
            consecutiveRedCount: 0,
            escalationTriggered: false
        };
    }

    return {
        attendancePercentage: riskData.attendancePercent,
        internalPercentage: riskData.internalPercent,
        assignmentPercentage: riskData.assignmentPercent,
        riskLevel: riskData.riskLevel,
        consecutiveRedCount: riskData.consecutiveRedCount,
        escalationTriggered: riskData.escalationTriggered
    };
};


/* ==================================================
                    MENTOR MODULE
================================================== */

// Get Dashboard Summaries and List of Mentees
exports.getMentorDashboard = async (req, res) => {
    try {
        const mentorId = req.user.id;

        // Query mentees directly via User.mentor — this is always set by assignMentors
        const mentees = await User.find({ mentor: mentorId, role: 'student', isActive: true })
            .select('fullName username registerNumber email');

        let totalMentees = mentees.length;
        let warningCount = 0;
        let criticalCount = 0;
        let upcomingFollowUps = 0;

        const menteeData = [];

        for (let student of mentees) {
            const riskData = await getCachedRiskLevel(student._id);
            if (riskData.riskLevel === 'Yellow') warningCount++;

            if (riskData.riskLevel === 'Red') criticalCount++;

            const lastInteraction = await MentorshipInteraction.findOne({ student: student._id, mentor: mentorId })
                .sort({ createdAt: -1 });

            if (lastInteraction && lastInteraction.followUpDate && new Date(lastInteraction.followUpDate) > new Date()) {
                upcomingFollowUps++;
            }

            menteeData.push({
                studentId: student._id,
                name: student.fullName || student.username,
                registerNumber: student.registerNumber || '',
                ...riskData,
                lastInteractionDate: lastInteraction ? lastInteraction.createdAt : null
            });
        }

        res.json({
            summary: { totalMentees, warningCount, criticalCount, upcomingFollowUps },
            mentees: menteeData
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error retrieving mentor dashboard', error: error.message });
    }
};

// Log a Mentee Interaction
exports.logInteraction = async (req, res) => {
    try {
        const mentorId = req.user.id;
        const { studentId, interactionType, summary, actionPlan, followUpDate } = req.body;

        const riskData = await getCachedRiskLevel(studentId);


        const newInteraction = new MentorshipInteraction({
            student: studentId,
            mentor: mentorId,
            interactionType,
            summary,
            actionPlan,
            followUpDate,
            riskLevelAtTimeOfInteraction: riskData.riskLevel
        });

        await newInteraction.save();

        // Auto-Escalate Check: If student remains Red for >= 2 evaluations (simplified here to if they log an interaction while Red and past interactions were also Red)
        if (riskData.riskLevel === 'Red') {
            const pastInteractions = await MentorshipInteraction.find({ student: studentId, mentor: mentorId })
                .sort({ createdAt: -1 }).limit(2);

            if (pastInteractions.length === 2 && pastInteractions[0].riskLevelAtTimeOfInteraction === 'Red' && pastInteractions[1].riskLevelAtTimeOfInteraction === 'Red') {
                // Check if an open escalation already exists
                const existingEscalation = await Escalation.findOne({ student: studentId, status: { $ne: 'Closed' } });
                if (!existingEscalation) {
                    const student = await User.findById(studentId);

                    const newEscalation = new Escalation({
                        student: studentId,
                        mentor: mentorId,
                        department: student.department || 'Unknown',
                        academicYear: student.academicYear || 'Unknown',
                        issueSummary: `Auto-escalated: Student remained in Critical (Red) state during back-to-back mentorship interactions.`
                    });
                    await newEscalation.save();
                }
            }
        }

        res.status(201).json({ message: 'Interaction logged successfully', interaction: newInteraction });
    } catch (error) {
        res.status(500).json({ message: 'Failed to log interaction', error: error.message });
    }
};

// Get Interactions for a specific student
exports.getMenteeInteractions = async (req, res) => {
    try {
        const { studentId } = req.params;
        const interactions = await MentorshipInteraction.find({ student: studentId })
            .populate('mentor', 'fullName username')
            .sort({ createdAt: -1 });

        res.json(interactions);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve interactions', error: error.message });
    }
};

/* ==================================================
                CLASS ADVISOR MODULE
================================================== */

exports.getAdvisorDashboard = async (req, res) => {
    try {
        const advisorId = req.user.id;
        const advisorRecord = await ClassAdvisor.findOne({ staff: advisorId });

        if (!advisorRecord) {
            return res.status(403).json({ message: 'Not assigned as a Class Advisor.' });
        }

        // Find students belonging to this advisor's assigned class/department
        const students = await User.find({
            role: 'student',
            department: advisorRecord.department,
            academicYear: advisorRecord.academicYear,
            isActive: true
        }).populate('mentor', 'fullName username')
          .select('fullName username email registerNumber batch section mentor');

        let totalStudents = students.length;
        let totalAttendancePercentage = 0;
        let totalInternalPercentage = 0;
        let totalRed = 0;
        let totalYellow = 0;

        const studentData = [];
        const mentorStats = {};

        for (let student of students) {
            const riskData = await getCachedRiskLevel(student._id);

            totalAttendancePercentage += riskData.attendancePercentage;
            totalInternalPercentage += riskData.internalPercentage;

            if (riskData.riskLevel === 'Yellow') totalYellow++;
            if (riskData.riskLevel === 'Red') totalRed++;

            // Mentor tracking
            const mentorName = student.mentor ? (student.mentor.fullName || student.mentor.username) : 'Unassigned';
            const mentorIdStr = student.mentor ? student.mentor._id.toString() : 'none';

            if (student.mentor) {
                if (!mentorStats[mentorIdStr]) {
                    mentorStats[mentorIdStr] = { name: mentorName, totalMentees: 0, redCases: 0, interactionCount: 0 };
                }
                mentorStats[mentorIdStr].totalMentees++;
                if (riskData.riskLevel === 'Red') mentorStats[mentorIdStr].redCases++;
            }

            // Escalation Status
            const escalation = await Escalation.findOne({ student: student._id, status: { $ne: 'Closed' } });

        studentData.push({
                studentId: student._id,
                name: student.fullName || student.username,
                username: student.username,
                email: student.email,
                registerNumber: student.registerNumber,
                batch: student.batch,
                section: student.section,
                mentorName,
                ...riskData,
                escalationStatus: escalation ? escalation.status : 'None'
            });
        }

        // Fetch total interactions per mentor
        for (let mId in mentorStats) {
            const iCount = await MentorshipInteraction.countDocuments({ mentor: new mongoose.Types.ObjectId(mId) });
            mentorStats[mId].interactionCount = iCount;
        }

        res.json({
            classSummary: {
                totalStudents,
                avgAttendance: totalStudents === 0 ? 0 : (totalAttendancePercentage / totalStudents),
                avgInternal: totalStudents === 0 ? 0 : (totalInternalPercentage / totalStudents),
                totalRed,
                totalYellow
            },
            students: studentData,
            mentorMonitor: Object.values(mentorStats)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error retrieving advisor dashboard', error: error.message });
    }
};

/* ==================================================
                HOD GOVERNANCE MODULE
================================================== */

exports.getHODGovernanceDashboard = async (req, res) => {
    try {
        const department = req.user.department;

        const students = await User.find({ role: 'student', department, isActive: true });
        const staff = await User.find({ role: 'staff', department });
        const classAdvisors = await ClassAdvisor.find({ department });

        let totalCriticalStudents = 0;
        const escalations = await Escalation.find({ department, status: { $ne: 'Closed' } })
            .populate('student', 'fullName registerNumber academicYear')
            .populate('mentor', 'fullName')
            .sort({ createdAt: -1 });

        // Calculate criticals
        for (let student of students) {
            const rd = await getCachedRiskLevel(student._id);
            if (rd.riskLevel === 'Red') totalCriticalStudents++;
        }


        // Mentor Performance
        const mentorPerformance = [];
        for (let mentor of staff) {
            const maps = await MentorStudentMap.find({ mentor: mentor._id, isActive: true });
            if (maps.length > 0) {
                let redStudents = 0;
                for (let map of maps) {
                    const rd = await getCachedRiskLevel(map.student);
                    if (rd.riskLevel === 'Red') redStudents++;
                }


                const interactions = await MentorshipInteraction.countDocuments({ mentor: mentor._id });
                const mentorEscalations = await Escalation.countDocuments({ mentor: mentor._id });

                mentorPerformance.push({
                    mentorId: mentor._id,
                    name: mentor.fullName || mentor.username,
                    totalStudents: maps.length,
                    redStudents,
                    interactionRate: maps.length === 0 ? 0 : (interactions / maps.length),
                    escalations: mentorEscalations
                });
            }
        }

        res.json({
            departmentSummary: {
                totalClasses: classAdvisors.length,
                totalStudents: students.length,
                totalMentors: staff.length, // approximation
                totalCriticalStudents,
                activeEscalations: escalations.length
            },
            escalations: escalations,
            mentorPerformance
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error retrieving HOD governance dashboard', error: error.message });
    }
};

exports.updateEscalation = async (req, res) => {
    try {
        const { escalationId } = req.params;
        const { status, note } = req.body;
        const hodId = req.user.id;

        const escalation = await Escalation.findById(escalationId);
        if (!escalation) return res.status(404).json({ message: 'Escalation not found' });

        if (status) {
            escalation.status = status;
            if (status === 'Closed') escalation.closedAt = new Date();
        }

        if (note) {
            escalation.hodDirectives.push({
                note,
                addedBy: hodId
            });
        }

        await escalation.save();
        res.json({ message: 'Escalation updated successfully', escalation });
    } catch (error) {
        res.status(500).json({ message: 'Server error updating escalation', error: error.message });
    }
};

/* ==================================================
                PRINCIPAL DASHBOARD
 ================================================== */

exports.getPrincipalDashboard = async (req, res) => {
    try {
        // Institution-wide aggregates
        const students = await User.find({ role: 'student', isActive: true });
        const risks = await StudentRisk.find({});
        const escalations = await Escalation.find({ status: { $ne: 'Closed' } });

        const deptStats = {};
        let totalRed = 0;
        let totalYellow = 0;
        let totalGreen = 0;

        risks.forEach(r => {
            if (r.riskLevel === 'Red') totalRed++;
            else if (r.riskLevel === 'Yellow') totalYellow++;
            else totalGreen++;

            if (r.department) {
                if (!deptStats[r.department]) deptStats[r.department] = { red: 0, yellow: 0, total: 0 };
                deptStats[r.department].total++;
                if (r.riskLevel === 'Red') deptStats[r.department].red++;
                if (r.riskLevel === 'Yellow') deptStats[r.department].yellow++;
            }
        });

        res.json({
            summary: {
                totalStudents: students.length,
                totalRed,
                totalYellow,
                totalGreen: Math.max(0, students.length - (totalRed + totalYellow)),
                activeEscalations: escalations.length
            },
            departmentComparison: Object.entries(deptStats).map(([dept, data]) => ({
                department: dept,
                ...data
            })),
            escalationLevels: {
                mentor: escalations.filter(e => e.currentLevel === 'Mentor').length,
                advisor: escalations.filter(e => e.currentLevel === 'Advisor').length,
                hod: escalations.filter(e => e.currentLevel === 'HOD').length
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error retrieving Principal dashboard', error: error.message });
    }
};


/* ==================================================
                INSTITUTIONAL SUITE (PRINCIPAL)
 ================================================== */

// GET Infrastructure Summary
const Infrastructure = require('../models/Infrastructure');
exports.getPrincipalInfrastructure = async (req, res) => {
    try {
        const infrastructure = await Infrastructure.find({});

        // If empty, seed some initial data for the user
        if (infrastructure.length === 0) {
            const seed = [
                { name: 'Main IT Lab', type: 'IT Hub', location: 'Block A, 2nd Floor', status: 'Functional', utilizationRate: 85 },
                { name: 'Physics Lab', type: 'Laboratory', location: 'Block B, Ground Floor', status: 'Functional', utilizationRate: 60 },
                { name: 'Conference Hall', type: 'Auditorium', location: 'C-Block', status: 'Maintenance', utilizationRate: 0 }
            ];
            await Infrastructure.insertMany(seed);
            return res.json(seed);
        }

        res.json(infrastructure);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving infrastructure data', error: error.message });
    }
};

// GET Institutional Goals (KPIs)
const Settings = require('../models/Settings');
exports.getInstitutionalGoals = async (req, res) => {
    try {
        const settings = await Settings.findOne({ isInitialized: true });
        res.json(settings ? settings.institutionalGoals : []);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET Institutional Staff Overview
exports.getPrincipalStaff = async (req, res) => {
    try {
        const hods = await User.find({ role: 'hod' }).select('fullName username email department lastLogin profileImage academicYear');
        const facultyMembers = await User.find({ role: 'staff' }).select('fullName username email department lastLogin profileImage academicYear');

        const staffDistribution = await User.aggregate([
            { $match: { role: 'staff' } },
            { $group: { _id: '$department', count: { $sum: 1 } } }
        ]);

        res.json({
            hods,
            staff: facultyMembers,
            allStaff: facultyMembers, // Adding another key for safety
            distribution: (staffDistribution || []).map(d => ({ department: d._id, count: d.count }))
        });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving staff overview', error: error.message });
    }
};

// GET Institutional Audit Logs
const AuditLog = require('../models/AuditLog');
exports.getPrincipalAuditLogs = async (req, res) => {
    try {
        const logs = await AuditLog.find({})
            .populate('performedBy', 'username fullName role')
            .sort({ timestamp: -1 })
            .limit(100);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving audit logs', error: error.message });
    }
};
