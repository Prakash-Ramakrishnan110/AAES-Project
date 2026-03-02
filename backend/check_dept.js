const mongoose = require('mongoose');
const User = require('./models/User');
const Subject = require('./models/Subject');
require('dotenv').config();

async function checkDeptConsistency() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aaes');

        const studentDepts = await User.distinct('department');
        const subjectDepts = await Subject.distinct('department');

        console.log('User Departments:', studentDepts.map(d => `"${d}"`));
        console.log('Subject Departments:', subjectDepts.map(d => `"${d}"`));

        const cseSubCheck = await Subject.find({ department: 'CSE', academicYear: '2023-2024', semester: '5' });
        console.log('Found subjects for "CSE" using exact query:', cseSubCheck.length);

        if (cseSubCheck.length > 0) {
            console.log('Subjects for "CSE":', cseSubCheck.map(s => ({ id: s._id, name: s.name })));
        }

        await mongoose.disconnect();
    } catch (err) { console.error(err); }
}

checkDeptConsistency();
