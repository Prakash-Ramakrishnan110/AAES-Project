const mongoose = require('mongoose');
const User = require('./models/User');

async function listAllStudents() {
    try {
        const mongoURI = 'mongodb://localhost:27017/aaes';
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        const students = await User.find({ role: 'student' }).select('username fullName department academicYear isActive mentor');
        console.log('\n--- ALL STUDENTS IN DB ---');
        students.forEach(s => {
            console.log(`- ${s.fullName || s.username} (@${s.username}), Dept: ${s.department}, Year: ${s.academicYear}, Active: ${s.isActive}, MentorID: ${s.mentor}`);
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

listAllStudents();
