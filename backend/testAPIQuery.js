const mongoose = require('mongoose');
const User = require('./models/User');
const Subject = require('./models/Subject');
const Assignment = require('./models/Assignment');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aaes').then(async () => {
    const student = await User.findOne({ username: 'prakash1935' });
    console.log('Student:', student.username, 'Dept:', student.department, 'Sem:', student.semester, 'Section:', student.section);

    let subjects = await Subject.find({ department: student.department, semester: student.semester });
    const subjectIds = subjects.map(s => s._id);

    console.log('Found', subjectIds.length, 'Subject IDs matching Dept/Sem');

    // Now simulate exactly what assignmentController does
    const query = {
        subject: { $in: subjectIds }
    };

    if (student.section) {
        query.$or = [
            { section: 'All' },
            { section: student.section },
            { section: { $exists: false } }
        ];
    }

    const assignments = await Assignment.find(query).populate('subject', 'name code').sort({ createdAt: -1 });

    console.log('API would return:', assignments.length, 'assignments:');
    assignments.forEach(a => console.log(`- ${a.title} (Section: ${a.section})`));

    process.exit(0);
});
