const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const StudentDocument = require('./models/StudentDocument');
const ClassAdvisor = require('./models/ClassAdvisor');

async function verifyFix() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const staffList = await User.find({ role: 'staff' });
        
        for (const staff of staffList) {
            console.log(`\nVerifying for Staff: ${staff.fullName} (ID: ${staff._id})`);
            
            // SIMULATE getDepartmentDocuments logic
            const explicitStudents = await User.find({ classAdvisor: staff._id }).select('_id');
            const explicitStudentIds = explicitStudents.map(s => s._id);
            
            const advisorRecord = await ClassAdvisor.findOne({ staff: staff._id });
            let deptYearStudentIds = [];
            
            if (advisorRecord) {
                console.log(`  -> found ClassAdvisor Record: Dept ${advisorRecord.department}, Year ${advisorRecord.academicYear}`);
                const studentsByDeptYear = await User.find({ 
                    role: 'student', 
                    department: advisorRecord.department, 
                    academicYear: advisorRecord.academicYear 
                }).select('_id');
                deptYearStudentIds = studentsByDeptYear.map(s => s._id);
            }
            
            const allStudentIds = [...new Set([...explicitStudentIds.map(id => id.toString()), ...deptYearStudentIds.map(id => id.toString())])];
            const docs = await StudentDocument.find({ studentId: { $in: allStudentIds } });
            
            console.log(`  -> Explicit students found: ${explicitStudentIds.length}`);
            console.log(`  -> Dept/Year students found: ${deptYearStudentIds.length}`);
            console.log(`  -> Total document count visible: ${docs.length}`);
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

verifyFix();
