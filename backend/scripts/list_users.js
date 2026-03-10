const mongoose = require('mongoose');
const User = require('./models/User');

async function listUsers() {
    try {
        const mongoURI = 'mongodb://localhost:27017/aaes';
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        const allUsers = await User.find({}).select('username fullName role department academicYear isActive');
        console.log('--- ALL USERS ---');
        allUsers.forEach(u => {
            console.log(`Username: ${u.username}, FullName: ${u.fullName}, Role: ${u.role}, Dept: ${u.department}, Year: ${u.academicYear}, isActive: ${u.isActive}`);
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

listUsers();
