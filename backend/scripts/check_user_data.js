const mongoose = require('mongoose');
const User = require('./models/User');

async function checkUser() {
    try {
        const mongoURI = 'mongodb://127.0.0.1:27017/aaes';
        await mongoose.connect(mongoURI);

        const advisor = await User.findById('699f2adda94de0bf38661994');
        console.log('--- USER DATA ---');
        console.log(JSON.stringify(advisor, null, 2));

        await mongoose.disconnect();
    } catch (err) { console.error(err); }
}
checkUser();
