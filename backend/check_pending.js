const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Submission = require('./models/Submission');

async function checkSubmissions() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const submissions = await Submission.find({ status: 'submitted' }).sort({ submittedAt: -1 }).limit(5);
        console.log('Most recent "submitted" submissions:');
        submissions.forEach(s => {
            console.log(`ID: ${s._id}, feedback: "${s.feedback}", aiResultStatus: ${s.aiResultStatus}, fileUrl: ${s.fileUrl}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkSubmissions();
