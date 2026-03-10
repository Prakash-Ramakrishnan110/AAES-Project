const mongoose = require('mongoose');
const User = require('./models/User');
const Subject = require('./models/Subject');
const Assignment = require('./models/Assignment');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aaes').then(async () => {
    const student = await User.findOne({ username: 'prakash1935' });
    let subjects = await Subject.find({ department: student.department, semester: student.semester, academicYear: student.academicYear });
    if (subjects.length === 0) {
        subjects = await Subject.find({ department: student.department, semester: student.semester });
    }
    const subjectIds = subjects.map(s => s._id);
    const assignments = await Assignment.find({
        subject: { $in: subjectIds },
        $or: [
            { section: 'All' },
            { section: student.section },
            { section: { $exists: false } }
        ]
    }).populate('subject', 'name code').sort({ createdAt: -1 });

    console.log(`Returned ${assignments.length} assignments:`);
    assignments.forEach(a => console.log(a.title, ' | Section:', a.section, ' | Subject:', a.subject.name));
    process.exit(0);
});
