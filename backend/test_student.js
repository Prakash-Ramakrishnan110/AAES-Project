const mongoose = require('mongoose');
require('dotenv').config({path: '.env'});
mongoose.connect(process.env.MONGO_URI).then(async () => {
    const Subject = mongoose.model('Subject', new mongoose.Schema({}, {strict: false}));
    const User = mongoose.model('User', new mongoose.Schema({}, {strict: false}));
    const subject = await Subject.findOne({name: /dsa/i});
    console.log('Subject:', subject.name, subject.department, subject.semester);
    const students = await User.find({role: 'student'});
    console.log('All students count:', students.length);
    console.log('Sample student dept:', students[0]?.department, 'sem:', students[0]?.semester);
    
    // Test the logic used in assignmentController
    const filtered = students.filter(s => 
        s.department.toLowerCase() === subject.department.toLowerCase() && 
        s.semester == subject.semester
    );
    console.log('Filtered locally:', filtered.length);
    process.exit(0);
});
