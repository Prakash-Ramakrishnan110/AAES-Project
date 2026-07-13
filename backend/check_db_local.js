const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

async function checkUsers() {
    try {
        if (!process.env.MONGO_URI) {
            console.error('MONGO_URI not found in .env');
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        
        const User = mongoose.connection.db.collection('users');
        const count = await User.countDocuments();
        console.log('Total users:', count);
        
        const allUsers = await User.find({}).project({ username: 1, role: 1, email: 1 }).toArray();
        console.log('Users list:', allUsers);
        
        await mongoose.connection.close();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkUsers();
