const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const StudentDocument = require('./models/StudentDocument');
const ClassAdvisor = require('./models/ClassAdvisor');

async function debugSpecificCase() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Find the Student
        const student = await User.findOne({ fullName: /prakash rr/i });
        if (!student) {
            console.log('Student "prakash rr" not found. Searching by name parts...');
            const results = await User.find({ fullName: /prakash/i, role: 'student' });
            console.log('Found students matching "prakash":', results.map(s => ({ id: s._id, name: s.fullName, role: s.role, dept: s.dept, year: s.academicYear })));
        } else {
            console.log('Student Found:', {
                id: student._id,
                fullName: student.fullName,
                registerNumber: student.registerNumber,
                department: student.department,
                academicYear: student.academicYear,
                classAdvisor: student.classAdvisor
            });
        }

        // 2. Find the Advisor
        const advisor = await User.findOne({ fullName: /jaseenash/i });
        if (!advisor) {
            console.log('Advisor "jaseenash" not found. Searching by name parts...');
            const results = await User.find({ fullName: /jaseenash/i, role: 'staff' });
            if (results.length === 0) {
                 const allStaff = await User.find({ role: 'staff' }).select('fullName username role');
                 console.log('All staff members:', allStaff);
            } else {
                 console.log('Found staff matching "jaseenash":', results.map(s => ({ id: s._id, name: s.fullName })));
            }
        } else {
            console.log('Advisor Found:', {
                id: advisor._id,
                fullName: advisor.fullName,
                username: advisor.username,
                department: advisor.department,
                academicYear: advisor.academicYear // Staff might have this if it's their personal record
            });
            
            const advisorRecord = await ClassAdvisor.findOne({ staff: advisor._id });
            if (advisorRecord) {
                console.log('ClassAdvisor Mapping Found:', {
                   dept: advisorRecord.department,
                   year: advisorRecord.academicYear
                });
            } else {
                console.log('No ClassAdvisor collection record found for this staff member.');
            }
        }

        // 3. Check Documents
        if (student) {
            const docs = await StudentDocument.find({ studentId: student._id });
            console.log(`Documents found for student ${student.fullName}:`, docs.map(d => ({
                id: d._id,
                type: d.documentType,
                status: d.status,
                dept: d.department
            })));
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

debugSpecificCase();
