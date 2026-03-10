const mongoose = require('mongoose');
const AuditLog = require('./models/AuditLog');
const User = require('./models/User');

async function checkAudit() {
    try {
        const mongoURI = 'mongodb://127.0.0.1:27017/aaes';
        await mongoose.connect(mongoURI);

        const advisor = await User.findOne({ username: /jaseenash/i });
        console.log(`Advisor ID: ${advisor?._id}`);

        const logs = await AuditLog.find({
            action: /MENTORSHIP/i,
            performedBy: advisor?._id
        }).sort({ timestamp: -1 }).limit(5);

        console.log('\n--- RECENT MENTORSHIP AUDIT LOGS ---');
        logs.forEach(l => {
            console.log(`[${l.timestamp}] Action: ${l.action}, Result: ${JSON.stringify(l.details)}`);
        });

        await mongoose.disconnect();
    } catch (err) { console.error(err); }
}
checkAudit();
