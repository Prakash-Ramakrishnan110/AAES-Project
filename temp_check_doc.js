const mongoose = require('mongoose');
const User = require('./backend/models/User');
require('dotenv').config({ path: './backend/.env' });

async function checkUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const students = await User.find({ role: 'student' }).limit(5);
        console.log('Sample Students:', JSON.stringify(students.map(s => ({
            id: s._id,
            username: s.username,
            fullName: s.fullName,
            name: s.name // Check for 'name' field too
        })), null, 2));
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkUsers();
