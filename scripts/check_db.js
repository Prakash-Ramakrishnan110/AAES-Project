const mongoose = require('mongoose');
const User = require('./backend/models/User');
const ClassAdvisor = require('./backend/models/ClassAdvisor');

async function checkUsers() {
    try {
        // Try to connect using the URI from common config or env if possible, 
        // but typically localhost:27017 is standard for dev.
        // We'll check the backend/server.js or .env if this fails.
        const mongoURI = 'mongodb://localhost:27017/aaes';
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        const prakashUsers = await User.find({ fullName: /prakash/i });
        console.log('\n--- PRAKASH USERS IN DB ---');
        prakashUsers.forEach(u => {
            console.log(`ID: ${u._id}`);
            console.log(`Name: ${u.fullName || u.username}`);
            console.log(`isActive: ${u.isActive}`);
            console.log(`Dept: ${u.department}`);
            console.log(`Year: ${u.academicYear}`);
            console.log(`Role: ${u.role}`);
            console.log('---------------------------');
        });

        // Check the advisor from the screenshot: jaseenash R
        const advisors = await User.find({ fullName: /jaseenash/i });
        console.log('\n--- ADVISOR(S) FOUND ---');
        for (const adv of advisors) {
            console.log(`ID: ${adv._id}, Name: ${adv.fullName}, Dept: ${adv.department}, Year: ${adv.academicYear}`);
            const advRecord = await ClassAdvisor.findOne({ staff: adv._id });
            if (advRecord) {
                console.log(`ClassAdvisor Record Found: Dept: ${advRecord.department}, Year: ${advRecord.academicYear}`);
            } else {
                console.log('No ClassAdvisor record found in ClassAdvisor collection.');
            }
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkUsers();
