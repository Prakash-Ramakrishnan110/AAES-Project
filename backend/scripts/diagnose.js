const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

async function diagnose() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('--- Database Diagnosis ---');

        const roles = await User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]);
        console.log('User Roles Distribution:', roles);

        const depts = await User.aggregate([{ $group: { _id: '$department', count: { $sum: 1 } } }]);
        console.log('Departments Distribution:', depts);

        const studentsInCSE = await User.countDocuments({ role: 'student', department: 'CSE' });
        console.log('Students in CSE:', studentsInCSE);

        const studentsIn_cse = await User.countDocuments({ role: 'student', department: 'cse' });
        console.log('Students in cse (lowercase):', studentsIn_cse);

        if (studentsInCSE === 0 && studentsIn_cse > 0) {
            console.log('ALERT: Department mismatch found (CSE vs cse)!');
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Diagnosis Failed:', err);
    }
}

diagnose();
