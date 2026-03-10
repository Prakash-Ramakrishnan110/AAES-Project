const mongoose = require('mongoose');
const User = require('./models/User');
const Subject = require('./models/Subject');
const Assignment = require('./models/Assignment');
const Submission = require('./models/Submission');
const ReEvaluationRequest = require('./models/ReEvaluationRequest');

async function check() {
    try {
        await mongoose.connect('mongodb://localhost:27017/aaes');
        const user = await User.findOne({ username: /jaseen/i });
        const staffId = user._id;

        const subjects = await Subject.find({ staff: staffId });
        const subjectIds = subjects.map(s => s._id);

        const assignments = await Assignment.find({ createdBy: staffId });
        const assignmentIds = assignments.map(a => a._id);

        const submissions = await Submission.find({ assignment: { $in: assignmentIds } });
        const submissionCount = submissions.length;
        const gradedCount = submissions.filter(s => s.status === 'graded').length;
        const pendingCount = submissionCount - gradedCount;

        const pendingReEval = await ReEvaluationRequest.countDocuments({
            subject: { $in: subjectIds },
            status: 'Pending'
        });

        console.log('User:', user.username);
        console.log('Subject IDs:', subjectIds);
        console.log('Pending Re-eval Count:', pendingReEval);
        console.log('Pending Total (Grading + Re-eval):', pendingCount + pendingReEval);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
