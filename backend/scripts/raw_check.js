const mongoose = require('mongoose');
const User = require('./models/User');
const ClassAdvisor = require('./models/ClassAdvisor');

async function rawCheck() {
    try {
        const mongoURI = 'mongodb://127.0.0.1:27017/aaes';
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        const advisorDocs = await ClassAdvisor.find({});
        console.log('\n--- RAW ADVISOR DOCS ---');
        console.log(JSON.stringify(advisorDocs, null, 2));

        const jaseenashUser = await User.findOne({
            $or: [
                { username: /jaseenash/i },
                { fullName: /jaseenash/i }
            ]
        });
        if (jaseenashUser) {
            console.log('\n--- JASEENASH USER ---');
            console.log(JSON.stringify(jaseenashUser, null, 2));
        } else {
            console.log('\nJaseenash user NOT found in User collection!');
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

rawCheck();
