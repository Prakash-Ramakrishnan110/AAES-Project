const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const ClassAdvisor = require('./models/ClassAdvisor');

// SIMULATE getMyClassStats logic
async function verifyStats() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const advisorId = '699f2adda94de0bf38661994'; // jaseenash R
        const assignment = await ClassAdvisor.findOne({ staff: advisorId });
        
        if (assignment) {
            console.log(`Found ClassAdvisor Record for ${advisorId}: Dept ${assignment.department}, Year ${assignment.academicYear}`);
            
            const explicit = await User.find({ classAdvisor: advisorId, role: 'student' }).select('-password');
            const deptYear = await User.find({
                role: 'student',
                department: assignment.department,
                academicYear: assignment.academicYear
            }).select('-password');

            const students = [...new Map([...explicit, ...deptYear].map(s => [s._id.toString(), s])).values()];
            console.log(`Final student list count: ${students.length}`);
            students.forEach(s => console.log(` - ${s.fullName} (${s.registerNumber})`));
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

verifyStats();
