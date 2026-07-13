const mongoose = require('mongoose');
const Submission = require('./backend/models/Submission');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

async function checkSubmissions() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const submissions = await Submission.find({ status: 'submitted' }).limit(5);
        console.log('Recent "submitted" submissions (pending eval):');
        submissions.forEach(s => {
            console.log(`ID: ${s._id}, feedback: "${s.feedback}", aiResultStatus: ${s.aiResultStatus}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkSubmissions();
