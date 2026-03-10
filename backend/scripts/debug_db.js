const mongoose = require('mongoose');
require('dotenv').config();

async function checkData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const User = require('./models/User');
        const Subject = require('./models/Subject');

        console.log('--- USERS ---');
        const users = await User.find({ role: 'staff' }).select('username fullName');
        console.log(users);

        console.log('--- SUBJECTS ---');
        const subjects = await Subject.find().populate('staff', 'username fullName');
        console.log(JSON.stringify(subjects, null, 2));

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkData();
