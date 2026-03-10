const mongoose = require('mongoose');
const User = require('./models/User');
const Subject = require('./models/Subject');
require('dotenv').config();

async function checkAcademicYears() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aaes');

        const userYears = await User.distinct('academicYear');
        const subjectYears = await Subject.distinct('academicYear');

        console.log('User Academic Years:', userYears);
        console.log('Subject Academic Years:', subjectYears);

        const student = await User.findOne({ fullName: /Student User/i });
        if (student) {
            console.log('Student User Data:', {
                name: student.fullName,
                year: student.academicYear,
                sem: student.semester
            });
        }

        const subjects = await Subject.find({}).limit(5);
        console.log('Sample Subjects:', subjects.map(s => ({ name: s.name, year: s.academicYear, sem: s.semester })));

        await mongoose.disconnect();
    } catch (err) { console.error(err); }
}

checkAcademicYears();
