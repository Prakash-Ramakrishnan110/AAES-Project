const mongoose = require('mongoose');
const StudentRisk = require('./models/StudentRisk');
const User = require('./models/User');

async function finalCheck() {
    try {
        const mongoURI = 'mongodb://127.0.0.1:27017/aaes';
        await mongoose.connect(mongoURI);

        const pr = await User.findOne({ username: 'Student User' });
        if (pr) {
            const risk = await StudentRisk.findOne({ student: pr._id }).sort({ lastCalculatedAt: -1 });
            console.log(`User: ${pr.fullName} (@${pr.username})`);
            console.log(`Risk: Attendance ${risk.attendancePercent}%, Internal ${risk.internalPercent}%, Level ${risk.riskLevel}`);
        } else {
            console.log('User not found');
        }

        await mongoose.disconnect();
    } catch (err) { console.error(err); }
}
finalCheck();
