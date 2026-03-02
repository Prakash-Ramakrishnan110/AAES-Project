const mongoose = require('mongoose');
const User = require('./models/User');
const Subject = require('./models/Subject');

const MONGO_URI = 'mongodb://127.0.0.1:27017/aaes';

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('Connected to DB');

        // Check what/who the ghost student ID is
        const ghostUser = await User.findById('699d69a16057344a80ff3f0b');
        console.log('Ghost student:', ghostUser ? `${ghostUser.username} / ${ghostUser.fullName} / role:${ghostUser.role} dept:${ghostUser.department} sem:${ghostUser.semester}` : 'NOT FOUND - User deleted');

        // Check student prakash
        const realStudent = await User.findById('699f2b15a94de0bf3866199f');
        console.log('Real student:', realStudent ? `${realStudent.username} / ${realStudent.fullName} / dept:${realStudent.department} sem:${realStudent.semester} academicYear:${realStudent.academicYear}` : 'NOT FOUND');

        // Check the subject
        const subject = await Subject.findById('699e7d8e2fa660cb561e5ad1'.substring(0, 999));
        // Actually find subject from assignment
        const Assignment = require('./models/Assignment');
        const ass = await Assignment.findById('699e7d8e2fa660cb561e5ad1');
        const subj = await Subject.findById(ass?.subject);
        console.log('\nSubject:', subj?.name, 'dept:', subj?.department, 'sem:', subj?.semester, 'academicYear:', subj?.academicYear);

        // Check all students
        const allStudents = await User.find({ role: 'student' });
        console.log('\nAll students:');
        allStudents.forEach(s => console.log(`  ${s.username} | dept:${s.department} | sem:${s.semester} | year:${s.academicYear}`));

        mongoose.disconnect();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
