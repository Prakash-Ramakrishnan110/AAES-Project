const mongoose = require('mongoose');
const ClassTimetable = require('./models/ClassTimetable');
const Subject = require('./models/Subject');

async function checkTimetable() {
    try {
        const mongoURI = 'mongodb://127.0.0.1:27017/aaes';
        await mongoose.connect(mongoURI);

        const bossId = '699f2956de7205cc1e149fbe';
        const entries = await ClassTimetable.find({ staffId: bossId }).populate('subjectId');

        console.log(`\n--- TIMETABLE FOR BOSS (${bossId}) ---`);
        entries.forEach(e => {
            console.log(`- Day: ${e.day}, Period: ${e.period}`);
            console.log(`  Subject: ${e.subjectId ? e.subjectId.code + ' - ' + e.subjectId.name : 'Unknown'}`);
            console.log(`  Dept: ${e.department}, Semester: ${e.semester}`);
            console.log(`  ID: ${e._id}`);
            console.log('---');
        });

        await mongoose.disconnect();
    } catch (err) { console.error(err); }
}
checkTimetable();
