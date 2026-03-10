const mongoose = require('mongoose');
const User = require('./models/User');
const Subject = require('./models/Subject');
const ReEvaluationRequest = require('./models/ReEvaluationRequest');
require('dotenv').config();

const verify = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/aaes');
        console.log('Connected to MongoDB');

        // 1. Get Jaseenash R
        const user = await User.findOne({ username: /jaseen/i });
        if (!user) {
            console.log('User jaseenash not found');
            process.exit(1);
        }
        console.log(`Verifying for user: ${user.username} (ID: ${user._id}, Role: ${user.role})`);

        // 2. Get subjects for this staff
        const subjects = await Subject.find({ staff: user._id });
        console.log(`Subjects assigned to staff: ${subjects.map(s => s.name).join(', ')}`);
        const subjectIds = subjects.map(s => s._id);

        // 3. Find re-evaluation requests for these subjects
        const requests = await ReEvaluationRequest.find({ subject: { $in: subjectIds } });
        console.log(`Found ${requests.length} re-evaluation requests for these subjects.`);

        // 4. Find ALL re-evaluation requests
        const allRequests = await ReEvaluationRequest.find({});
        console.log(`Total re-evaluation requests in DB: ${allRequests.length}`);

        if (requests.length === allRequests.length) {
            console.log('SUCCESS: Staff sees all requests because they are assigned to all subjects involved.');
        } else {
            console.log(`Staff sees ${requests.length}/${allRequests.length} requests (Filtered correctly).`);
        }

        // 5. Test Mock Controller Logic
        const query = {};
        if (user.role === 'staff') {
            const staffSubjects = await Subject.find({ staff: user._id }).select('_id');
            const sIds = staffSubjects.map(s => s._id);
            query.subject = { $in: sIds };
        }
        const filteredReqs = await ReEvaluationRequest.find(query);
        console.log(`Mock Controller result count: ${filteredReqs.length}`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

verify();
