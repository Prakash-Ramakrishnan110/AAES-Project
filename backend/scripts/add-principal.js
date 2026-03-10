/**
 * One-time script to add the Principal user to your existing database.
 * Run: node add-principal.js
 * This does NOT wipe any existing data.
 */
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const run = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/aaes');
        console.log('MongoDB Connected');

        const existing = await User.findOne({ email: 'principal@aaes.com' });
        if (existing) {
            console.log('✅ Principal user already exists:', existing.email);
            console.log('   Role:', existing.role);
            console.log('   Password: password123 (unless changed)');
            process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('password123', salt);

        await User.create({
            username: 'Dr. James Wilson',
            fullName: 'Dr. James Wilson',
            email: 'principal@aaes.com',
            password: hash,
            role: 'principal',
            department: 'Administration'
        });

        console.log('✅ Principal user created successfully!');
        console.log('   Email:    principal@aaes.com');
        console.log('   Password: password123');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
};

run();
