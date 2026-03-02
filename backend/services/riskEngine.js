/**
 * riskEngine.js
 * Event-driven risk recalculation service.
 * Call recalculateRiskForStudent() after any data change.
 * Updates only the affected student — no full DB scan.
 */

const StudentRisk = require('../models/StudentRisk');
const InternalMark = require('../models/InternalMark');
const InternalPattern = require('../models/InternalPattern');
const Attendance = require('../models/Attendance');
const Assignment = require('../models/Assignment');
const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Calculate risk level from the three percentages.
 * GREEN:  attendance >= 75 AND internal >= 50 AND assignment >= 60
 * YELLOW: attendance <  75 OR  internal <  50 OR  assignment <  60
 * RED:    attendance <  60 OR  internal <  40 OR  assignment <  40
 */
function computeRiskLevel(attendancePct, internalPct, assignmentPct) {
    if (attendancePct < 60 || internalPct < 40 || assignmentPct < 40) return 'Red';
    if (attendancePct < 75 || internalPct < 50 || assignmentPct < 60) return 'Yellow';
    return 'Green';
}

/**
 * Main entry point. Called after any mark/attendance/grade update.
 * Non-blocking: wrapped in setImmediate so it doesn't delay the HTTP response.
 *
 * @param {string|ObjectId} studentId
 * @param {string} semester  — e.g. "3"
 * @param {string} academicYear — e.g. "2025-2026"
 */
async function recalculateRiskForStudent(studentId, semester, academicYear) {
    setImmediate(async () => {
        try {
            const student = await User.findById(studentId).select('department semester academicYear');
            if (!student) return;

            // Use provided semester/year or fall back to student profile
            const sem = semester || student.semester || '1';
            const year = academicYear || student.academicYear || new Date().getFullYear() + '-' + (new Date().getFullYear() + 1);

            // ─── 1. Internal Marks Percentage ───────────────────────────────────
            const internalMark = await InternalMark.findOne({ student: studentId, semester: sem, academicYear: year });
            let internalPercent = 100; // Default to 100 (no pattern set yet)
            if (internalMark && internalMark.totalMax > 0) {
                internalPercent = (internalMark.totalObtained / internalMark.totalMax) * 100;
            } else {
                // Check if pattern exists — if yes, treat as 0%
                const pattern = await InternalPattern.findOne({ semester: sem, academicYear: year, department: student.department });
                if (pattern) internalPercent = 0;
            }

            // ─── 2. Attendance Percentage ────────────────────────────────────────
            const attendances = await Attendance.find({ 'records.student': studentId });
            let totalClasses = 0, attendedClasses = 0;
            attendances.forEach(rec => {
                const r = rec.records.find(r => r.student.toString() === studentId.toString());
                if (r) {
                    totalClasses++;
                    if (r.status === 'Present') attendedClasses++;
                }
            });
            const attendancePercent = totalClasses === 0 ? 100 : (attendedClasses / totalClasses) * 100;

            // ─── 3. Assignment Completion Percentage ─────────────────────────────
            // Count assignments visible to this student's department/semester
            const relevantAssignments = await Assignment.countDocuments({
                department: student.department,
                semester: sem,
                academicYear: year
            });
            const gradedSubmissions = await Submission.countDocuments({
                student: studentId,
                status: 'graded'
            });
            const assignmentPercent = relevantAssignments === 0 ? 100 : Math.min(100, (gradedSubmissions / relevantAssignments) * 100);

            // ─── 4. Compute risk ─────────────────────────────────────────────────
            const riskLevel = computeRiskLevel(attendancePercent, internalPercent, assignmentPercent);

            // ─── 5. Upsert StudentRisk cache ─────────────────────────────────────
            const existing = await StudentRisk.findOne({ student: studentId, semester: sem, academicYear: year });
            const wasRed = existing?.riskLevel === 'Red';
            const newConsecutiveRed = riskLevel === 'Red'
                ? (wasRed ? (existing.consecutiveRedCount || 0) + 1 : 1)
                : 0;

            const riskDoc = await StudentRisk.findOneAndUpdate(
                { student: studentId, semester: sem, academicYear: year },
                {
                    $set: {
                        department: student.department,
                        internalPercent: Math.round(internalPercent * 10) / 10,
                        attendancePercent: Math.round(attendancePercent * 10) / 10,
                        assignmentPercent: Math.round(assignmentPercent * 10) / 10,
                        riskLevel,
                        consecutiveRedCount: newConsecutiveRed,
                        lastCalculatedAt: new Date()
                    }
                },
                { upsert: true, new: true }
            );

            // Notify Student if Risk becomes Red or Yellow
            if (riskLevel !== 'Green' && (!existing || existing.riskLevel !== riskLevel)) {
                await Notification.create({
                    user: studentId,
                    title: 'Academic Risk Alert',
                    message: `Your academic risk level has changed to ${riskLevel}. Please check your attendance and marks.`,
                    type: riskLevel === 'Red' ? 'Alert' : 'Warning',
                    link: '/student/dashboard'
                });
            }

            // ─── 6. Trigger escalation if 2+ consecutive RED ─────────────────────
            if (newConsecutiveRed >= 2 && !riskDoc.escalationTriggered) {
                const { triggerEscalation } = require('./escalationEngine');
                await triggerEscalation(studentId, sem, year, newConsecutiveRed);
                await StudentRisk.updateOne(
                    { student: studentId, semester: sem, academicYear: year },
                    { $set: { escalationTriggered: true } }
                );
            }

        } catch (err) {
            console.error('[RiskEngine] Error recalculating risk for student', studentId, err.message);
        }
    });
}

module.exports = { recalculateRiskForStudent, computeRiskLevel };
