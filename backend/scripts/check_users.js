const mongoose = require('mongoose');

async function checkUsers() {
    try {
        await mongoose.connect('mongodb://localhost:27017/aaes');
        const users = await mongoose.connection.db.collection('users').find({}).toArray();
        console.log('Total users:', users.length);
        users.forEach(u => {
            console.log(`- Username: ${u.username}, Email: ${u.email}, Role: ${u.role}, Active: ${u.isActive}`);
        });
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkUsers();
