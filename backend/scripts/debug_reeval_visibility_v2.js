const mongoose = require('mongoose');
const User = require('./models/User');
const Assignment = require('./models/Assignment');
const Subject = require('./models/Subject');
const ReEvaluationRequest = require('./models/ReEvaluationRequest');

async function debugReEval() {
    try {
        const mongoURI = 'mongodb://localhost:27017/aaes';
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        // Look for users with 'jaseen' or 'ash' in username or fullName
        const users = await User.find({
            $or: [
                { username: /jaseen/i },
                { fullName: /jaseen/i }
            ]
        });

        console.log(`\nFound ${users.length} matching users for 'jaseen':`);
        users.forEach(u => {
            console.log(`- ID: ${u._id}, Username: ${u.username}, FullName: ${u.fullName}, Role: ${u.role}`);
        });

        const requests = await ReEvaluationRequest.find({})
            .populate('student', 'fullName username')
            .populate('assignment', 'title')
            .populate('subject', 'name');

        console.log(`\nFound ${requests.length} re-evaluation requests in total.`);

        requests.forEach((req, idx) => {
            console.log(`\n[${idx + 1}] Request ID: ${req._id}`);
            console.log(`  Status: ${req.status}`);
            console.log(`  Student: ${req.student?.fullName || req.student?.username}`);
            console.log(`  Assignment: ${req.assignment?.title}`);
            console.log(`  Subject: ${req.subject?.name}`);
            console.log(`  Reason: ${req.reason}`);
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

debugReEval();
