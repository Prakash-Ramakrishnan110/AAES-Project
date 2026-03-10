const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkDuplicates() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aaes');

        const students = await User.find({ role: 'student' }).select('username fullName department academicYear semester');
        console.log('--- All Students ---');
        console.table(students.map(s => ({
            id: s._id,
            user: s.username,
            name: s.fullName,
            dept: s.department,
            year: s.academicYear,
            sem: s.semester
        })));

        await mongoose.disconnect();
    } catch (err) { console.error(err); }
}

checkDuplicates();
