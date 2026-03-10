const mongoose = require('mongoose');
const InternalMark = require('./models/InternalMark');
const User = require('./models/User');

async function checkMarks() {
    try {
        const mongoURI = 'mongodb://127.0.0.1:27017/aaes';
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        const students = await User.find({ fullName: /prakash/i });

        console.log('\n--- INTERNAL MARKS FOR PRAKASH STUDENTS ---');
        for (const student of students) {
            const marks = await InternalMark.find({ student: student._id });
            console.log(`Student: ${student.fullName} (@${student.username})`);
            if (marks.length > 0) {
                marks.forEach(m => {
                    console.log(`- Sem: ${m.semester}, Year: ${m.academicYear}, Total: ${m.totalObtained}/${m.totalMax}`);
                });
            } else {
                console.log('No internal mark records found.');
            }
            console.log('---');
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkMarks();
