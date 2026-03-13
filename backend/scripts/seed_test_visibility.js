const mongoose = require('mongoose');
const User = require('../models/User');
const ClassAdvisor = require('../models/ClassAdvisor');
const Subject = require('../models/Subject');

const seedTestData = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/aaes');
        const staff = await User.findOne({ email: 'staff@aaes.com' });
        const hod = await User.findOne({ role: 'hod', department: 'CSE' });

        if (!staff || !hod) {
            console.log('Staff or HOD user not found');
            process.exit();
        }

        // 1. Create Class Advisor Entry
        await ClassAdvisor.deleteMany({ department: 'CSE', academicYear: '3rd Year' });
        await ClassAdvisor.create({
            staff: staff._id,
            department: 'CSE',
            academicYear: '3rd Year', // Valid enum value
            assignedBy: hod._id // Valid assignedBy ID
        });
        console.log('Seed: Created Class Advisor Entry');

        // 2. Create and Assign Subjects
        await Subject.deleteMany({ staff: staff._id });
        const subjects = [
            { name: 'Data Structures', code: 'CS301', department: 'CSE', semester: '3', academicYear: '2023-2024', staff: [staff._id] },
            { name: 'Operating Systems', code: 'CS501', department: 'CSE', semester: '5', academicYear: '2023-2024', staff: [staff._id] }
        ];
        await Subject.insertMany(subjects);
        console.log('Seed: Assigned Subjects');

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedTestData();
