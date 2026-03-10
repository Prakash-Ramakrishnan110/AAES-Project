const mongoose = require('mongoose');
const Subject = require('./models/Subject');

async function checkITSubjects() {
    try {
        const mongoURI = 'mongodb://127.0.0.1:27017/aaes';
        await mongoose.connect(mongoURI);

        const itSubjects = await Subject.find({ department: /IT/i });
        console.log(`\nFound ${itSubjects.length} subjects in IT department:`);
        for (const s of itSubjects) {
            console.log(`- ID: ${s._id}`);
            console.log(`  Name: ${s.name} (${s.code})`);
            console.log(`  Dept: ${s.department}, Semester: ${s.semester}`);
            console.log(`  Teacher Assigned: ${s.teacher}`);
            console.log('---');
        }

        await mongoose.disconnect();
    } catch (err) { console.error(err); }
}
checkITSubjects();
