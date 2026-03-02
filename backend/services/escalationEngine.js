/**
 * escalationEngine.js
 * Handles auto-escalation when students stay RED for consecutive recalculations.
 * Also exposes a function for the daily cron job to promote stale escalations.
 */

const Escalation = require('../models/Escalation');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');

/**
 * Triggered by riskEngine when consecutiveRedCount >= 2.
 * Creates a new escalation at Mentor level if none active.
 */
async function triggerEscalation(studentId, semester, academicYear, consecutiveRedCount) {
    try {
        const student = await User.findById(studentId).select('fullName username mentor classAdvisor department academicYear');
        if (!student) return;

        // Check for existing open escalation
        const existing = await Escalation.findOne({
            student: studentId,
            semester,
            status: { $ne: 'Closed' }
        });
        if (existing) return; // Already escalated

        if (!student.mentor) {
            console.warn('[EscalationEngine] Student has no mentor assigned — skipping escalation for', studentId);
            return;
        }

        const escalation = await Escalation.create({
            student: studentId,
            mentor: student.mentor,
            advisor: student.classAdvisor || null,
            department: student.department || 'Unknown',
            academicYear: student.academicYear || academicYear,
            semester,
            reason: 'AUTO_RISK_ENGINE',
            issueSummary: `Auto-escalated: Student remained in RED risk state for ${consecutiveRedCount} consecutive recalculations.`,
            currentLevel: 'Mentor',
            consecutiveRedCount,
            triggeredAt: new Date(),
            status: 'Open',
            resolved: false
        });

        await AuditLog.create({
            action: 'ESCALATION_TRIGGERED',
            performedBy: student.mentor,
            role: 'system',
            targetId: escalation._id,
            targetModel: 'Escalation',
            department: student.department,
            details: { studentId, consecutiveRedCount, currentLevel: 'Mentor' }
        });

        console.log('[EscalationEngine] Escalation created for student', studentId, 'at Mentor level');
    } catch (err) {
        console.error('[EscalationEngine] triggerEscalation error:', err.message);
    }
}

/**
 * Promote stale escalations to next level.
 * Called daily by cron job.
 * 7 days at Mentor → promote to Advisor
 * 7 days at Advisor → promote to HOD
 */
async function promoteStaleEscalations() {
    try {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        // Promote Mentor → Advisor
        const mentorStale = await Escalation.find({
            status: { $ne: 'Closed' },
            currentLevel: 'Mentor',
            triggeredAt: { $lt: sevenDaysAgo }
        });

        for (const esc of mentorStale) {
            esc.currentLevel = 'Advisor';
            await esc.save();
            await AuditLog.create({
                action: 'ESCALATION_PROMOTED',
                performedBy: esc.mentor,
                role: 'system',
                targetId: esc._id,
                targetModel: 'Escalation',
                department: esc.department,
                details: { from: 'Mentor', to: 'Advisor' }
            });
        }

        // Promote Advisor → HOD
        const advisorStale = await Escalation.find({
            status: { $ne: 'Closed' },
            currentLevel: 'Advisor',
            triggeredAt: { $lt: sevenDaysAgo }
        });

        for (const esc of advisorStale) {
            esc.currentLevel = 'HOD';
            await esc.save();
            await AuditLog.create({
                action: 'ESCALATION_PROMOTED',
                performedBy: esc.mentor,
                role: 'system',
                targetId: esc._id,
                targetModel: 'Escalation',
                department: esc.department,
                details: { from: 'Advisor', to: 'HOD' }
            });
        }

        console.log(`[EscalationEngine] Promoted ${mentorStale.length} → Advisor, ${advisorStale.length} → HOD`);
    } catch (err) {
        console.error('[EscalationEngine] promoteStaleEscalations error:', err.message);
    }
}

module.exports = { triggerEscalation, promoteStaleEscalations };
