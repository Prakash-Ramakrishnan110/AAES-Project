const mongoose = require('mongoose');
const User = require('./models/User');
const Subject = require('./models/Subject');
const ReEvaluationRequest = require('./models/ReEvaluationRequest');

async function check() {
    try {
        await mongoose.connect('mongodb://localhost:27017/aaes');
        const user = await User.findOne({ username: /jaseen/i });
        const staffSubjects = await Subject.find({ staff: user._id }).select('_id');
        const sIds = staffSubjects.map(s => s._id);
        const query = { subject: { $in: sIds } };
        const requests = await ReEvaluationRequest.find(query);
        console.log('User:', user.username);
        console.log('Subject IDs:', sIds);
        console.log('Requests Found:', requests.length);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
