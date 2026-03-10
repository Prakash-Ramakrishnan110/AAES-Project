const mongoose = require('mongoose');
const Subject = require('./models/Subject');

async function searchAllOOSE() {
    try {
        const mongoURI = 'mongodb://127.0.0.1:27017/aaes';
        await mongoose.connect(mongoURI);

        const allSubjects = await Subject.find({});
        console.log(`Total subjects in DB: ${allSubjects.length}`);

        const ooseSubjects = await Subject.find({ name: { $regex: /OOSE/i } });
        console.log(`\nFound ${ooseSubjects.length} subjects matching "OOSE":`);
        for (const s of ooseSubjects) {
            console.log(`- ID: ${s._id}, Name: ${s.name}, Dept: ${s.department}, Teacher: ${s.teacher}`);
        }

        await mongoose.disconnect();
    } catch (err) { console.error(err); }
}
searchAllOOSE();
