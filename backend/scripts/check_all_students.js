const mongoose = require('mongoose');
const User = require('./models/User');
const ClassAdvisor = require('./models/ClassAdvisor');

async function checkAllStudents() {
    try {
        const mongoURI = 'mongodb://localhost:27017/aaes';
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        // Find all students in CSE 3rd Year
        const students = await User.find({
            role: 'student',
            department: 'CSE',
            academicYear: '3rd Year'
        });

        console.log('\n--- ALL CSE 3RD YEAR STUDENTS ---');
        console.log(`Total count in DB: ${students.length}`);
        students.forEach(u => {
            console.log(`- ID: ${u._id}, Name: ${u.fullName || u.username}, isActive: ${u.isActive}, MentorID: ${u.mentor}`);
        });

        const activeCount = students.filter(s => s.isActive !== false).length;
        console.log(`\nActive Students (isActive !== false): ${activeCount}`);
        console.log(`Inactive Students (isActive === false): ${students.length - activeCount}`);

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkAllStudents();
