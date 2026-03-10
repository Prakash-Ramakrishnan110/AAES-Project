const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const addPrincipal = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aaes');
        console.log('MongoDB Connected');

        const email = 'principal@aaes.com';

        // Delete existing if any to fix double hashing issue
        await User.deleteOne({ email });
        console.log('Cleaned up existing principal user');

        await User.create({
            username: 'Institutional Principal',
            fullName: 'Dr. James Wilson',
            email: email,
            password: 'password123', // Let the model pre-save hook hash it once
            role: 'principal',
            department: 'Administration',
            isActive: true
        });

        console.log('Principal user created correctly!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

addPrincipal();
