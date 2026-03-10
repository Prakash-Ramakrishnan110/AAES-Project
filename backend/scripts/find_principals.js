const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function findPrincipals() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const principals = await User.find({ role: 'principal' }).select('username fullName email');
        console.log('Principals found:', principals);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

findPrincipals();
