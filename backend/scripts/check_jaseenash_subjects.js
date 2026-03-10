const mongoose = require('mongoose');
const User = require('./models/User');
const Subject = require('./models/Subject');

async function checkSubjectStaff() {
    try {
        const mongoURI = 'mongodb://localhost:27017/aaes';
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        const user = await User.findOne({ username: /jaseenash/i });
        if (!user) {
            console.log('User jaseenash not found');
            return;
        }

        const subjects = await Subject.find({ staffId: user._id });
        console.log(`\nSubjects taught by ${user.username} (${user._id}):`);
        subjects.forEach(s => {
            console.log(`- ${s.name} (${s.code})`);
        });

        const webDesign = await Subject.findOne({ name: /web design/i });
        if (webDesign) {
            console.log(`\nWeb Design Subject Info:`);
            console.log(`- ID: ${webDesign._id}`);
            console.log(`- Name: ${webDesign.name}`);
            console.log(`- StaffId in Subject: ${webDesign.staffId}`);

            if (webDesign.staffId && webDesign.staffId.toString() === user._id.toString()) {
                console.log(`SUCCESS: User teaches web design.`);
            } else {
                console.log(`FAILURE: User does NOT teach web design according to Subject model.`);
            }
        } else {
            console.log('Web Design subject not found.');
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkSubjectStaff();
