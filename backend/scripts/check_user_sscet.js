const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function checkUser() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ username: 'sscet' });
        if (user) {
            console.log('User sscet found:');
            console.log('Role:', user.role);
            console.log('ID:', user._id);
        } else {
            console.log('User sscet NOT found');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkUser();
