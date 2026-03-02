const mongoose = require('mongoose');
const User = require('./models/User');
const Subject = require('./models/Subject');
const Attendance = require('./models/Attendance');
require('dotenv').config();

async function fixAcademicYear() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aaes');

        const user = await User.findOne({ fullName: /prakash/i, role: 'student' });
        if (!user) return console.log('User not found');

        console.log('Old Academic Year:', user.academicYear);
        user.academicYear = '2023-2024';
        await user.save();
        console.log('Updated Academic Year to 2023-2024');

        // Check matching subjects now
        const subjects = await Subject.find({
            department: user.department,
            academicYear: user.academicYear,
            semester: user.semester
        });
        console.log(`Matching Subjects Now Found: ${subjects.length}`);

        // Ensure there's at least one attendance record for the student to see
        if (subjects.length > 0) {
            const webDesign = subjects.find(s => s.name.toLowerCase().includes('web'));
            if (webDesign) {
                const existingSession = await Attendance.findOne({ subject: webDesign._id });
                if (existingSession) {
                    // Add student to existing record if not there
                    const hasStudent = existingSession.records.some(r => r.student.toString() === user._id.toString());
                    if (!hasStudent) {
                        existingSession.records.push({ student: user._id, status: 'Present' });
                        await existingSession.save();
                        console.log('Added student to existing attendance session.');
                    }
                } else {
                    // Create new session
                    await Attendance.create({
                        subject: webDesign._id,
                        date: new Date(),
                        period: '1',
                        markedBy: user._id, // placeholder
                        records: [{ student: user._id, status: 'Present' }]
                    });
                    console.log('Created new attendance session.');
                }
            }
        }

        await mongoose.disconnect();
    } catch (err) { console.error(err); }
}

fixAcademicYear();
