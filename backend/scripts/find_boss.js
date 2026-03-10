const mongoose = require('mongoose');
const User = require('./models/User');

async function findBoss() {
    try {
        const mongoURI = 'mongodb://127.0.0.1:27017/aaes';
        await mongoose.connect(mongoURI);

        const boss = await User.findOne({ fullName: /Boss/i });
        if (!boss) {
            const bossByUsername = await User.findOne({ username: /Boss/i });
            console.log('Boss by Username:', JSON.stringify(bossByUsername, null, 2));
        } else {
            console.log('Boss by FullName:', JSON.stringify(boss, null, 2));
        }

        await mongoose.disconnect();
    } catch (err) { console.error(err); }
}
findBoss();
