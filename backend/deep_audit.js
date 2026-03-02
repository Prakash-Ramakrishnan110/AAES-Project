const mongoose = require('mongoose');
const User = require('./models/User');
const Subject = require('./models/Subject');
require('dotenv').config();

async function deepAudit() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/aaes');

        const student = await User.findOne({ fullName: /prakash/i });
        if (!student) return console.log('Student not found');

        console.log(`Student [${student.username}]:`);
        console.log(`  dept: "${student.department}" (len: ${student.department.length})`);
        console.log(`  year: "${student.academicYear}" (len: ${student.academicYear.length})`);
        console.log(`  sem:  "${student.semester}" (len: ${student.semester.length})`);

        const subjects = await Subject.find({ department: 'CSE' });
        console.log(`\nCSE Subjects Found: ${subjects.length}`);
        subjects.forEach(s => {
            console.log(`Subject [${s.name}]:`);
            console.log(`  dept: "${s.department}" (len: ${s.department.length})`);
            console.log(`  year: "${s.academicYear}" (len: ${s.academicYear.length})`);
            console.log(`  sem:  "${s.semester}" (len: ${s.semester.length})`);
        });

        await mongoose.disconnect();
    } catch (err) { console.error(err); }
}

deepAudit();
