const mongoose = require('mongoose');
const User = require('./models/User');
const Subject = require('./models/Subject');
const Assignment = require('./models/Assignment');
const Submission = require('./models/Submission');

const MONGO_URI = 'mongodb://127.0.0.1:27017/aaes';

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('Connected to DB\n');

        const assignments = await Assignment.find().populate('subject', 'name department semester academicYear staff');
        console.log('=== ALL ASSIGNMENTS ===');
        for (const a of assignments) {
            const submissions = await Submission.find({ assignment: a._id });
            console.log('Title:', a.title);
            console.log('  ID:', a._id.toString());
            console.log('  Subject Staff IDs:', JSON.stringify(a.subject && a.subject.staff));
            console.log('  CreatedBy:', a.createdBy.toString());
            console.log('  Submissions count:', submissions.length);
            for (const s of submissions) {
                console.log('    - Sub', s._id.toString(), 'student=', s.student ? s.student.toString() : 'NULL', 'status=', s.status);
            }
            console.log('');
        }

        const staffUsers = await User.find({ role: 'staff' });
        console.log('=== ALL STAFF ===');
        staffUsers.forEach(function (s) { console.log(' ', s.username, '(' + s._id + ')'); });

        const subjects = await Subject.find().populate('staff', 'username');
        console.log('\n=== ALL SUBJECTS & STAFF ===');
        subjects.forEach(function (s) {
            const staffNames = s.staff.map(function (st) { return st.username + ' (' + st._id + ')'; }).join(', ');
            console.log(' ', s.name, '(' + s._id + '): staff=[' + staffNames + ']');
        });

        mongoose.disconnect();
    })
    .catch(function (err) {
        console.error(err);
        process.exit(1);
    });
