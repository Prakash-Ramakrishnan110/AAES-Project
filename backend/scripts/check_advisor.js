const mongoose = require('mongoose');
const User = require('./models/User');
const ClassAdvisor = require('./models/ClassAdvisor');

async function checkAdvisor() {
    try {
        const mongoURI = 'mongodb://localhost:27017/aaes';
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        const advisors = await User.find({ fullName: /jaseenash/i });
        console.log('\n--- ADVISOR SEARCH ---');
        for (const adv of advisors) {
            console.log(`ID: ${adv._id}, Name: ${adv.fullName}, Username: ${adv.username}, Role: ${adv.role}`);
            const advRecord = await ClassAdvisor.findOne({ staff: adv._id });
            if (advRecord) {
                console.log(`ClassAdvisor Record: Dept: ${advRecord.department}, Year: ${advRecord.academicYear}`);

                // Find all students for this class AGAIN to be absolutely sure
                const students = await User.find({
                    role: 'student',
                    department: advRecord.department,
                    academicYear: advRecord.academicYear
                });
                console.log(`Students for this advisor's class: ${students.length}`);
                students.forEach(s => {
                    console.log(`- ${s.fullName} (${s.username}), isActive: ${s.isActive}`);
                });
            } else {
                console.log('No ClassAdvisor record found for this user.');
            }
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkAdvisor();
