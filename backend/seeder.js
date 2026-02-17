const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

dotenv.config();

const seedUsers = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/aaes');
        console.log('MongoDB Connected');

        await User.deleteMany();

        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash('123456', salt);

        const users = [
            {
                username: 'Admin User',
                email: 'admin@aaes.com',
                password: 'password123', // Will be hashed by pre-save hook
                role: 'admin',
                department: 'Administration'
            },
            {
                username: 'HOD CSE',
                email: 'hod.cse@aaes.com',
                password: 'password123',
                role: 'hod',
                department: 'CSE'
            },
            {
                username: 'Staff User',
                email: 'staff@aaes.com',
                password: 'password123',
                role: 'staff',
                department: 'CSE',
                academicYear: '2023-2024'
            },
            {
                username: 'Student User',
                email: 'student@aaes.com',
                password: 'password123',
                role: 'student',
                department: 'CSE',
                academicYear: '2023-2024',
                semester: '6'
            }
        ];

        // We use create instead of insertMany to trigger the pre-save hook for password hashing
        for (const user of users) {
            await User.create(user);
        }

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

seedUsers();
