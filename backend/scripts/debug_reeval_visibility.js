const mongoose = require('mongoose');
const User = require('./models/User');
const ReEvaluationRequest = require('./models/ReEvaluationRequest');
const Subject = require('./models/Subject');

async function debugReEval() {
    try {
        const mongoURI = 'mongodb://localhost:27017/aaes';
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        const user = await User.findOne({ fullName: /jaseenash/i });
        if (!user) {
            console.log('User jaseenash not found');
        } else {
            console.log('\n--- USER INFO ---');
            console.log(`ID: ${user._id}`);
            console.log(`Name: ${user.fullName}`);
            console.log(`Role: ${user.role}`);
            console.log(`Dept: ${user.department}`);
            console.log('-----------------');
        }

        const requests = await ReEvaluationRequest.find({})
            .populate('student', 'fullName')
            .populate('assignment', 'title')
            .populate('subject', 'name');

        console.log(`\nFound ${requests.length} re-evaluation requests total.`);

        requests.forEach((req, idx) => {
            console.log(`\n[${idx + 1}] ID: ${req._id}`);
            console.log(`  Student: ${req.student?.fullName}`);
            console.log(`  Assignment: ${req.assignment?.title}`);
            console.log(`  Subject: ${req.subject?.name}`);
            console.log(`  Status: ${req.status}`);
            console.log(`  Reason: ${req.reason}`);
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

debugReEval();
