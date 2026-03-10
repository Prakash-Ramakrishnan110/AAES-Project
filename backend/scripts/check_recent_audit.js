const mongoose = require('mongoose');
const AuditLog = require('./models/AuditLog');

async function checkRecent() {
    try {
        const mongoURI = 'mongodb://127.0.0.1:27017/aaes';
        await mongoose.connect(mongoURI);

        const logs = await AuditLog.find({
            timestamp: { $gte: new Date(Date.now() - 1000 * 60 * 10) } // Last 10 mins
        }).sort({ timestamp: -1 });

        console.log(`\n--- RECENT AUDIT LOGS (LAST 10 MINS) ---`);
        console.log(`Found ${logs.length} logs.`);
        logs.forEach(l => {
            console.log(`[${l.timestamp}] Action: ${l.action}, User: ${l.performedBy}, Target: ${l.targetModel} (${l.targetId}), Details: ${JSON.stringify(l.details)}`);
        });

        await mongoose.disconnect();
    } catch (err) { console.error(err); }
}
checkRecent();
