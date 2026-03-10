const mongoose = require('mongoose');
require('dotenv').config();
const Subject = require('./models/Subject');

async function checkSubjects() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const subjects = await Subject.find({});
        console.log(`Checking ${subjects.length} subjects...`);

        const faultySubjects = subjects.filter(s => !s.department || !s.semester);

        if (faultySubjects.length > 0) {
            console.log('Found subjects with missing department or semester:');
            faultySubjects.forEach(s => {
                console.log(`ID: ${s._id}, Name: ${s.name}, Dept: "${s.department}", Sem: "${s.semester}"`);
            });
        } else {
            console.log('All subjects have department and semester populated.');
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

checkSubjects();
