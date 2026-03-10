const mongoose = require('mongoose');
const User = require('./models/User');
const Subject = require('./models/Subject');
const Attendance = require('./models/Attendance');
require('dotenv').config();

async function simulateGetMyAttendance() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aaes');

        const user = await User.findOne({ fullName: /prakash/i, role: 'student' });
        if (!user) return console.log('User not found');

        console.log('User Profile:', {
            id: user._id,
            dept: user.department,
            year: user.academicYear,
            sem: user.semester
        });

        // Simulating getMyAttendance logic
        const subjects = await Subject.find({
            department: user.department,
            academicYear: user.academicYear,
            semester: user.semester
        });

        console.log('Matching Subjects Found:', subjects.length);
        console.log(subjects.map(s => ({ name: s.name, code: s.code, dept: s.department, year: s.academicYear, sem: s.semester })));

        if (subjects.length > 0) {
            const subjectIds = subjects.map(s => s._id);
            const sessions = await Attendance.find({
                subject: { $in: subjectIds }
            }).populate('subject', 'name code');

            console.log('Total Sessions Found:', sessions.length);

            const stats = subjects.map(subject => {
                const subjectSessions = sessions.filter(s => s.subject._id.toString() === subject._id.toString());
                let present = 0;
                let total = 0;
                subjectSessions.forEach(session => {
                    const record = session.records.find(r => r.student.toString() === user._id.toString());
                    if (record) {
                        total++;
                        if (record.status === 'Present') present++;
                    }
                });
                return { name: subject.name, present, total };
            });
            console.log('Calculated Stats:', stats);
        } else {
            console.log('CRITICAL: No subjects found for this user criteria.');
            // Let's see what subjects DO exist for this department
            const deptSubs = await Subject.find({ department: user.department });
            console.log('All Subjects in this Dept:', deptSubs.map(s => ({ name: s.name, year: s.academicYear, sem: s.semester })));
        }

        await mongoose.disconnect();
    } catch (err) { console.error(err); }
}

simulateGetMyAttendance();
