const mongoose = require('mongoose');
const Submission = require('./models/Submission');
const Assignment = require('./models/Assignment');
const User = require('./models/User');
const Subject = require('./models/Subject');

const MONGO_URI = 'mongodb://127.0.0.1:27017/aaes';

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('Connected to DB');

        // Check the submission that has no student
        const badSub = await Submission.findById('699e7e292fa660cb561e5b15');
        console.log('Bad submission raw:', JSON.stringify(badSub, null, 2));

        // Check the assignment
        const ass = await Assignment.findById('699e7d8e2fa660cb561e5ad1').populate('subject');
        console.log('\nAssignment:', ass?.title, 'SubjectId:', ass?.subject?._id);

        // Check what students exist matching the subject criteria
        if (ass?.subject) {
            const subj = ass.subject;
            console.log('\nSubject dept:', subj.department, 'sem:', subj.semester);
            const students = await User.find({ role: 'student', department: subj.department, semester: subj.semester });
            console.log('Matching students:', students.map(s => `${s.username} (${s._id})`));
        }

        // Check the staff who owns the assignment
        console.log('\nAssignment createdBy:', ass?.createdBy);
        if (ass?.subject) {
            console.log('Subject staff:', ass.subject.staff);
        }

        // Check if the good submission has the student matching the above
        const goodSub = await Submission.findById('699f2d48a94de0bf38661a9c');
        console.log('\nGood submission student field:', goodSub?.student);

        mongoose.disconnect();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
