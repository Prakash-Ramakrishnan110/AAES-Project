const mongoose = require('mongoose');
const User = require('./models/User');
const Subject = require('./models/Subject');

async function checkSubjectAssignment() {
    try {
        const mongoURI = 'mongodb://127.0.0.1:27017/aaes';
        await mongoose.connect(mongoURI);

        const user = await User.findOne({ username: /jaseenash/i });
        console.log(`User: ${user.fullName} (${user._id}), Dept: ${user.department}`);

        const subjects = await Subject.find({ name: /OOSE/i });
        console.log(`\nFound ${subjects.length} subjects matching "OOSE":`);
        for (const s of subjects) {
            console.log(`- ID: ${s._id}`);
            console.log(`  Name: ${s.name} (${s.code})`);
            console.log(`  Dept: ${s.department}, Semester: ${s.semester}`);
            console.log(`  Teacher Assigned: ${s.teacher}`);
            console.log(`  Is Match: ${s.teacher && s.teacher.toString() === user._id.toString()}`);
            console.log('---');
        }

        await mongoose.disconnect();
    } catch (err) { console.error(err); }
}
checkSubjectAssignment();
