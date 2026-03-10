const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const StaffAssignmentRequest = require('./models/StaffAssignmentRequest');
const AuditLog = require('./models/AuditLog');

async function fixSubjectAndAssignment() {
    try {
        const mongoURI = 'mongodb://127.0.0.1:27017/aaes';
        await mongoose.connect(mongoURI);

        const subjectId = '69ad4f4ddc4d796d5a14760d'; // oops
        const requestId = '69ad4f64dc4d796d5a14763a'; // pending request
        const jaseenashId = '699f2adda94de0bf38661994';

        // 1. Rename Subject
        const subject = await Subject.findById(subjectId);
        if (subject) {
            subject.name = 'OOSE';
            // Also ensure jaseenash is in staff list directly if we're bypassing UI
            if (!subject.staff.includes(jaseenashId)) {
                subject.staff.push(jaseenashId);
            }
            await subject.save();
            console.log('Renamed subject to OOSE and added staff.');
        }

        // 2. Approve Request
        const request = await StaffAssignmentRequest.findById(requestId);
        if (request) {
            request.status = 'APPROVED';
            await request.save();
            console.log('Marked assignment request as APPROVED.');
        }

        // 3. Create Audit Log
        await AuditLog.create({
            action: 'APPROVE_ASSIGNMENT_REQUEST',
            performedBy: '699f2956de7205cc1e149fbd', // Admin ID (system)
            targetId: requestId,
            targetModel: 'StaffAssignmentRequest',
            department: 'CSE',
            details: { staffId: jaseenashId, subjectId: subjectId, manualFix: true }
        });
        console.log('Created Audit Log.');

        await mongoose.disconnect();
    } catch (err) { console.error(err); }
}
fixSubjectAndAssignment();
