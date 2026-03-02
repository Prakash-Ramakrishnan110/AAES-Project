const mongoose = require('mongoose');
const User = require('./models/User');
const Subject = require('./models/Subject');
const Attendance = require('./models/Attendance');
require('dotenv').config();

async function deepSync() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/aaes');
        console.log('Syncing starting...');

        // 1. Get the authoritative subjects list for Semester 5
        const targetSubjects = await Subject.find({ semester: '5', academicYear: '2023-2024' });
        if (targetSubjects.length === 0) {
            console.log('ERROR: No Semester 5 subjects found to sync to.');
            return;
        }
        console.log(`Targeting ${targetSubjects.length} subjects in Sem 5`);

        // 2. Find all students who SHOULD see this data
        // We'll update both 'Student User' and 'prakash r'
        const students = await User.find({ role: 'student' });

        for (const student of students) {
            console.log(`Syncing student: ${student.username}...`);
            student.department = 'CSE';
            student.academicYear = '2023-2024';
            student.semester = '5';
            await student.save();

            // 3. Ensure student is in at least one attendance record
            const webDesign = targetSubjects.find(s => s.name.toLowerCase().includes('web'));
            if (webDesign) {
                let session = await Attendance.findOne({ subject: webDesign._id });
                if (!session) {
                    session = await Attendance.create({
                        subject: webDesign._id,
                        date: new Date(),
                        period: '1',
                        markedBy: student._id,
                        records: []
                    });
                }

                const hasStudent = session.records.some(r => r.student.toString() === student._id.toString());
                if (!hasStudent) {
                    session.records.push({ student: student._id, status: 'Present' });
                    await session.save();
                }
            }
        }

        console.log('Deep Sync Complete. All students updated to CSE/2023-2024/Sem 5');
        await mongoose.disconnect();
    } catch (err) { console.error(err); }
}

deepSync();
