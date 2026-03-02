const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const User = require('../models/User');

const checkStudents = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Successfully connected to MongoDB.');

        const students = await User.find({ role: 'student' }).select('fullName registerNumber department semester section');

        console.log('\n--- STUDENT LISTING ---');
        if (students.length === 0) {
            console.log('No students found in the database.');
        } else {
            console.table(students.map(s => ({
                Name: s.fullName,
                RegNo: s.registerNumber,
                Dept: s.department,
                Sem: s.semester,
                Sec: s.section
            })));
            console.log(`\nTotal Students Found: ${students.length}`);
        }

    } catch (err) {
        console.error('Connection Error:', err.message);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
};

checkStudents();
