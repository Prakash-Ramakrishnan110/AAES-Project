const mongoose = require('mongoose');
const Submission = require('./models/Submission');
const Assignment = require('./models/Assignment');
const User = require('./models/User');

const MONGO_URI = 'mongodb://127.0.0.1:27017/aaes'; // Assuming default local db

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('Connected to DB');
        const submissions = await Submission.find()
            .populate('assignment', 'title')
            .populate('student', 'username fullName role');

        console.log(`Found ${submissions.length} submissions.`);
        for (const sub of submissions) {
            console.log(`Submission ID: ${sub._id}`);
            console.log(`Assignment: ${sub.assignment?.title} (${sub.assignment?._id})`);
            console.log(`Student: ${sub.student?.username} / ${sub.student?.fullName} (${sub.student?._id})`);
            console.log(`Status: ${sub.status}`);
            console.log(`Submitted At: ${sub.submittedAt}`);
            console.log('---');
        }

        mongoose.disconnect();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
