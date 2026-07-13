const mongoose = require('mongoose');
require('dotenv').config({path: '.env'});
mongoose.connect(process.env.MONGO_URI).then(async () => {
    const Subject = mongoose.model('Subject', new mongoose.Schema({}, {strict: false}));
    const User = mongoose.model('User', new mongoose.Schema({}, {strict: false}));
    const subject = await Subject.findOne({name: /dsa/i});
    
    console.log('subject.semester type:', typeof subject.semester);
    
    const student = await User.findOne({role: 'student'});
    console.log('student.semester type:', typeof student.semester);
    
    const exactMatch = await User.find({
        role: 'student',
        department: subject.department,
        semester: subject.semester
    });
    console.log('Exact Match Count:', exactMatch.length);
    
    const stringMatch = await User.find({
        role: 'student',
        department: subject.department,
        semester: String(subject.semester)
    });
    console.log('String Match Count:', stringMatch.length);

    process.exit(0);
});
