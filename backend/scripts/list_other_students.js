const mongoose = require('mongoose');
const User = require('./models/User');

async function listOtherStudents() {
    try {
        const mongoURI = 'mongodb://127.0.0.1:27017/aaes';
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        const excludeIds = [
            '699f2956de7205cc1e149fbf',
            '699f2b15a94de0bf3866199f',
            '69ad4593dc4d796d5a146fff'
        ];

        const students = await User.find({
            role: 'student',
            _id: { $nin: excludeIds }
        }).select('username fullName department academicYear isActive');

        console.log('\n--- OTHER STUDENTS IN DB ---');
        console.log(`Count: ${students.length}`);
        students.forEach(s => {
            console.log(`- ${s.fullName || s.username} (@${s.username}), Dept: ${s.department}, Year: ${s.academicYear}, Active: ${s.isActive}`);
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

listOtherStudents();
