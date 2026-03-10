const mongoose = require('mongoose');
const AuditLog = require('./models/AuditLog');
const User = require('./models/User');

async function checkAllLogs() {
    try {
        const mongoURI = 'mongodb://127.0.0.1:27017/aaes';
        await mongoose.connect(mongoURI);

        const advisor = await User.findOne({ username: /jaseenash/i });
        if (!advisor) {
            console.log('Advisor not found');
            return;
        }

        const logs = await AuditLog.find({
            performedBy: advisor._id
        }).sort({ timestamp: -1 }).limit(10);

        console.log(`\n--- RECENT AUDIT LOGS FOR ${advisor.username} (${advisor._id}) ---`);
        logs.forEach(l => {
            console.log(`[${l.timestamp}] Action: ${l.action}, Target: ${l.targetModel} (${l.targetId}), Details: ${JSON.stringify(l.details)}`);
        });

        await mongoose.disconnect();
    } catch (err) { console.error(err); }
}
checkAllLogs();
