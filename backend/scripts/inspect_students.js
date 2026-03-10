const mongoose = require('mongoose');
const User = require('./models/User');

async function checkFlexible() {
    try {
        const mongoURI = 'mongodb://127.0.0.1:27017/aaes';
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        // Find ALL students and check their dept/year strings
        const students = await User.find({ role: 'student' });
        console.log('\n--- ALL STUDENTS INSPECTION ---');
        students.forEach(s => {
            console.log(`Name: [${s.fullName}]`);
            console.log(`Dept: [${s.department}]`);
            console.log(`Year: [${s.academicYear}]`);
            console.log(`Active: ${s.isActive}`);
            console.log('---');
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkFlexible();
