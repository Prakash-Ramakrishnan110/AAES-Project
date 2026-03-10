const mongoose = require('mongoose');
const User = require('./models/User');

async function listAll() {
    try {
        const mongoURI = 'mongodb://127.0.0.1:27017/aaes';
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        const students = await User.find({ role: 'student' });
        console.log(`\nFound ${students.length} students total.`);
        students.forEach(s => {
            console.log(`- ${s.fullName || s.username} (@${s.username}), Dept: ${s.department}, Year: ${s.academicYear}, Active: ${s.isActive}`);
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

listAll();
