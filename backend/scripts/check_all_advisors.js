const mongoose = require('mongoose');
const User = require('./models/User');
const ClassAdvisor = require('./models/ClassAdvisor');

async function checkAllAdvisors() {
    try {
        const mongoURI = 'mongodb://localhost:27017/aaes';
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        const advisors = await ClassAdvisor.find({}).populate('staff', 'username fullName');
        console.log('\n--- ALL CLASS ADVISORS ---');
        for (const record of advisors) {
            console.log(`Advisor: ${record.staff?.fullName} (@${record.staff?.username})`);
            console.log(`Dept: ${record.department}, Year: ${record.academicYear}`);

            const students = await User.find({
                role: 'student',
                department: record.department,
                academicYear: record.academicYear
            });
            console.log(`Active in DB: ${students.filter(s => s.isActive !== false).length}`);
            console.log(`Inactive in DB: ${students.filter(s => s.isActive === false).length}`);
            console.log('---');
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkAllAdvisors();
