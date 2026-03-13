const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const ClassAdvisor = require('../models/ClassAdvisor');
const Subject = require('../models/Subject');
const bcrypt = require('bcryptjs');

dotenv.config();

const seedUsers = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/aaes');
        console.log('MongoDB Connected');

        await User.deleteMany();
        await ClassAdvisor.deleteMany();
        await Subject.deleteMany();

        const salt = await bcrypt.genSalt(10);
        const defaultPasswordHash = await bcrypt.hash('password123', salt);
        const labPasswordHash = await bcrypt.hash('lab123', salt);

        const users = [
            {
                username: 'Admin User',
                email: 'admin@aaes.com',
                password: defaultPasswordHash,
                role: 'admin',
                department: 'Administration'
            },
            {
                username: 'HOD CSE',
                email: 'hod.cse@aaes.com',
                password: defaultPasswordHash,
                role: 'hod',
                department: 'CSE'
            },
            {
                username: 'Staff User',
                email: 'staff@aaes.com',
                password: defaultPasswordHash,
                role: 'staff',
                department: 'CSE',
                academicYear: '2023-2024'
            },
            {
                username: 'Student User',
                email: 'student@aaes.com',
                password: defaultPasswordHash,
                role: 'student',
                department: 'CSE',
                academicYear: '2023-2024',
                semester: '6'
            },
            {
                username: 'Dr. James Wilson',
                fullName: 'Dr. James Wilson',
                email: 'principal@aaes.com',
                password: defaultPasswordHash,
                role: 'principal',
                department: 'Administration'
            },
            {
                username: 'Lab Assistant',
                email: 'lab@aaes.com',
                password: labPasswordHash,
                role: 'lab-assistant',
                department: 'CSE'
            }
        ];

        await User.insertMany(users);

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

seedUsers();
