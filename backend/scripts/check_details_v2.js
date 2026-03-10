const mongoose = require('mongoose');
const User = require('./models/User');
const InternalPattern = require('./models/InternalPattern');

async function checkDetails() {
    try {
        const mongoURI = 'mongodb://127.0.0.1:27017/aaes';
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        const students = await User.find({ fullName: /prakash/i, isActive: true });
        console.log('\n--- STUDENT PROPERTIES ---');
        for (const s of students) {
            console.log(`Name: ${s.fullName} (@${s.username})`);
            console.log(`Dept: ${s.department}, Year: ${s.academicYear}, Sem: ${s.semester}`);
            console.log('---');
        }

        const patterns = await InternalPattern.find({});
        console.log('\n--- INTERNAL PATTERNS ---');
        patterns.forEach(p => {
            console.log(`Dept: ${p.department}, Year: ${p.academicYear}, Sem: ${p.semester}, Tests: ${p.tests.length}`);
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkDetails();
