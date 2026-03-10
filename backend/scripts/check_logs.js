const mongoose = require('mongoose');
const AuditLog = require('./models/AuditLog');

async function checkLogs() {
    try {
        const mongoURI = 'mongodb://127.0.0.1:27017/aaes';
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        const logs = await AuditLog.find({ action: /USER/i }).sort({ timestamp: -1 }).limit(10);
        console.log('\n--- RECENT USER AUDIT LOGS ---');
        logs.forEach(l => {
            console.log(`[${l.timestamp}] Action: ${l.action}, Target: ${l.targetModel} (${l.targetId}), Details: ${JSON.stringify(l.details)}`);
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkLogs();
