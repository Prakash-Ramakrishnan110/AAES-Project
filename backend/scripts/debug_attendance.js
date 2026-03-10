const mongoose = require('mongoose');
const User = require('./models/User');
const Subject = require('./models/Subject');
const Attendance = require('./models/Attendance');
require('dotenv').config();

async function debugAttendance() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aaes');
        console.log('Connected to MongoDB');

        // 1. Find the student
        const student = await User.findOne({ role: 'student' });
        if (!student) {
            console.log('No student found');
            process.exit(1);
        }
        console.log('--- Student Data ---');
        console.log(JSON.stringify({
            id: student._id,
            fullName: student.fullName,
            username: student.username,
            department: student.department,
            academicYear: student.academicYear,
            semester: student.semester
        }, null, 2));

        // 2. Find subjects matching student
        const filter = {
            department: student.department,
            academicYear: student.academicYear,
            semester: student.semester
        };
        const subjects = await Subject.find(filter);
        console.log(`--- Matching Subjects (Found ${subjects.length}) ---`);
        console.log(subjects.map(s => ({ name: s.name, code: s.code, dept: s.department, year: s.academicYear, sem: s.semester })));

        if (subjects.length === 0) {
            console.log('--- Checking Global Subject List for Any Matches ---');
            const allSubjects = await Subject.find({}).limit(10);
            console.log(allSubjects.map(s => ({ name: s.name, dept: s.department, year: s.academicYear, sem: s.semester })));
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debugAttendance();
