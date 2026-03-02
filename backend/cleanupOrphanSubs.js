// Cleanup script: remove submissions with deleted/non-existent students
const mongoose = require('mongoose');
const Submission = require('./models/Submission');
const User = require('./models/User');

const MONGO_URI = 'mongodb://127.0.0.1:27017/aaes';

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('Connected to DB');
        const submissions = await Submission.find();
        let removed = 0;
        for (const sub of submissions) {
            if (!sub.student) {
                console.log('Removing submission with no student field:', sub._id.toString());
                await sub.deleteOne();
                removed++;
                continue;
            }
            const user = await User.findById(sub.student);
            if (!user) {
                console.log('Removing orphaned submission (student deleted):', sub._id.toString(), 'studentId:', sub.student.toString());
                await sub.deleteOne();
                removed++;
            }
        }
        console.log('Cleanup complete. Removed', removed, 'orphaned submission(s).');
        mongoose.disconnect();
    })
    .catch(function (err) {
        console.error(err);
        process.exit(1);
    });
