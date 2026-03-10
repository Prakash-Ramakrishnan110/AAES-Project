const mongoose = require('mongoose');
const User = require('./models/User');
const Attendance = require('./models/Attendance');
const Subject = require('./models/Subject');
require('dotenv').config();

async function fixAndVerify() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aaes');

        const student = await User.findOne({ username: 'Student User' });
        if (!student) return console.log('Student not found');

        console.log('Old Semester:', student.semester);
        student.semester = '5'; // Match subjects in DB
        await student.save();
        console.log('Updated Semester to 5');

        // Check if there are attendance records for Semester 5 subjects
        const subjects = await Subject.find({ department: 'CSE', semester: '5', academicYear: '2023-2024' });
        const subjectIds = subjects.map(s => s._id);

        const attendanceCount = await Attendance.countDocuments({ subject: { $in: subjectIds } });
        console.log(`Attendance sessions found for Sem 5: ${attendanceCount}`);

        if (attendanceCount === 0) {
            console.log('No attendance sessions found. Creating a dummy session for "web design"...');
            const webDesign = subjects.find(s => s.name === 'web design');
            if (webDesign) {
                await Attendance.create({
                    subject: webDesign._id,
                    date: new Date(),
                    period: '1',
                    markedBy: student._id, // Just for dummy
                    records: [{ student: student._id, status: 'Present' }]
                });
                console.log('Created dummy attendance session.');
            }
        }

        await mongoose.disconnect();
    } catch (err) { console.error(err); }
}

fixAndVerify();
