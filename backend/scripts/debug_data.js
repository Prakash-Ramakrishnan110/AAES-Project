const mongoose = require('mongoose');
const User = require('./models/User');
const ClassAdvisor = require('./models/ClassAdvisor');

const mongoURI = 'mongodb://localhost:27017/aaes'; // Standard URI, adjust if needed

async function checkData() {
    try {
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        const user = await User.findOne({ username: /jaseenash/i });
        if (!user) {
            console.log('User jaseenash not found');
            return;
        }
        console.log('Found User:', { id: user._id, username: user.username, role: user.role, department: user.department, academicYear: user.academicYear });

        const advisorRecord = await ClassAdvisor.findOne({ staff: user._id });
        if (!advisorRecord) {
            console.log('ClassAdvisor record NOT found for this user');
        } else {
            console.log('Found ClassAdvisor Record:', advisorRecord);
        }

        // Check if there are students in that dept/year
        if (advisorRecord) {
            const students = await User.find({
                role: 'student',
                department: advisorRecord.department,
                academicYear: advisorRecord.academicYear
            });
            console.log(`Found ${students.length} students in ${advisorRecord.department} - ${advisorRecord.academicYear}`);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkData();
