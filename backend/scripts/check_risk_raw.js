const mongoose = require('mongoose');
const StudentRisk = require('./models/StudentRisk');
const User = require('./models/User');

async function checkRiskRecords() {
    try {
        const mongoURI = 'mongodb://127.0.0.1:27017/aaes';
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        const students = await User.find({ fullName: /prakash/i });

        console.log('\n--- RISK RECORDS FOR PRAKASH STUDENTS ---');
        for (const student of students) {
            const risk = await StudentRisk.findOne({ student: student._id }).sort({ lastCalculatedAt: -1 });
            console.log(`Student: ${student.fullName} (@${student.username})`);
            console.log(`isActive: ${student.isActive}`);
            if (risk) {
                console.log(`Risk Data: Attendance: ${risk.attendancePercent}%, Internal: ${risk.internalPercent}%, Level: ${risk.riskLevel}`);
                console.log(`Calculated At: ${risk.lastCalculatedAt}`);
            } else {
                console.log('No Risk Data record found.');
            }
            console.log('---');
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkRiskRecords();
