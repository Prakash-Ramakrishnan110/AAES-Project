const mongoose = require('mongoose');
require('dotenv').config({path: '.env'});
mongoose.connect(process.env.MONGO_URI).then(async () => {
    const Assignment = require('./models/Assignment');
    const Subject = require('./models/Subject');
    const User = require('./models/User');
    
    // Find dsa assignment
    const assignment = await Assignment.findOne({title: /dsa/i}).populate('subjectId');
    if (!assignment) {
        console.log('Assignment not found');
        return process.exit(1);
    }
    
    console.log('Assignment title:', assignment.title);
    
    const subject = assignment.subjectId;
    if (!subject) {
        console.log('Subject not populated or missing');
        return process.exit(1);
    }
    
    console.log('Subject name:', subject.name, 'Dept:', subject.department, 'Sem:', subject.semester);
    
    const students = await User.find({
        role: 'student',
        department: { $regex: new RegExp(`^${subject.department}$`, 'i') },
        semester: subject.semester
    });
    console.log('Students count with regex:', students.length);
    
    // Check assignments list logic
    const hod = await User.findOne({ role: 'hod' });
    const subjects = await Subject.find({
        department: { $regex: new RegExp(`^${hod.department}$`, 'i') }
    });
    console.log('HOD Dept:', hod.department);
    console.log('HOD Subjects Count:', subjects.length);
    
    process.exit(0);
});
