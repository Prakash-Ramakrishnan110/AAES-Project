const mongoose = require('mongoose');
const User = require('./models/User');
const Subject = require('./models/Subject');
require('dotenv').config();

async function checkAllStudentSubjects() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/aaes');

        const students = await User.find({ role: 'student' });
        console.log(`Checking subjects for ${students.length} students...`);

        for (const s of students) {
            const subs = await Subject.find({
                department: s.department,
                academicYear: s.academicYear,
                semester: s.semester
            });
            console.log(`Student: ${s.username} (${s.fullName})`);
            console.log(`  Query: dept="${s.department}", year="${s.academicYear}", sem="${s.semester}"`);
            console.log(`  Found: ${subs.length} subjects`);
            if (subs.length > 0) {
                console.log(`  Names: ${subs.map(sub => sub.name).join(', ')}`);
            }
            console.log('---');
        }

        await mongoose.disconnect();
    } catch (err) { console.error(err); }
}

checkAllStudentSubjects();
