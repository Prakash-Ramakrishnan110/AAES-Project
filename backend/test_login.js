const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function testLogin() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/aaes');
        const User = require('./models/User'); // Use the actual model
        
        const email = 'admin@aaes.com';
        const password = 'password123';
        
        const user = await User.findOne({ 
            $or: [
                { email: email.toLowerCase() },
                { username: email } 
            ]
        });

        if (!user) {
            console.log('User not found');
            await mongoose.disconnect();
            return;
        }

        const isMatch = await user.matchPassword(password);
        console.log(`User: ${user.username}, Role: ${user.role}, Match: ${isMatch}`);
        
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

testLogin();
