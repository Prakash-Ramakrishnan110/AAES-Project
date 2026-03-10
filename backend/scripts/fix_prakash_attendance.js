const mongoose = require('mongoose');
const User = require('./models/User');
const Subject = require('./models/Subject');
require('dotenv').config();

async function fixUserPrakash() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aaes');

        // Find the specific user from the screenshot
        const user = await User.findOne({ fullName: /prakash/i, role: 'student' });
        if (!user) {
            console.log('User "prakash r" not found. Searching all student users...');
            const allStudents = await User.find({ role: 'student' });
            console.log(allStudents.map(s => ({ name: s.fullName, username: s.username, sem: s.semester, dept: s.department })));
            return;
        }

        console.log('Found User:', {
            id: user._id,
            fullName: user.fullName,
            username: user.username,
            department: user.department,
            academicYear: user.academicYear,
            semester: user.semester
        });

        // Check matching subjects
        const subjects = await Subject.find({
            department: user.department,
            academicYear: user.academicYear,
            semester: user.semester
        });

        console.log(`Matching Subjects for current sem (${user.semester}): ${subjects.length}`);

        if (subjects.length === 0) {
            console.log('Checking Semester 5 subjects...');
            const sem5Subjects = await Subject.find({
                department: user.department,
                academicYear: user.academicYear,
                semester: '5'
            });
            console.log(`Found ${sem5Subjects.length} subjects in Semester 5.`);

            if (sem5Subjects.length > 0) {
                user.semester = '5';
                await user.save();
                console.log('Successfully updated "prakash r" to Semester 5.');
            } else {
                console.log('No subjects found in Semester 5 either. Listing all subjects for tracking:');
                const allSubs = await Subject.find({ department: user.department }).limit(10);
                console.log(allSubs.map(s => ({ name: s.name, sem: s.semester, year: s.academicYear })));
            }
        }

        await mongoose.disconnect();
    } catch (err) { console.error(err); }
}

fixUserPrakash();
