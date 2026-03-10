const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const StudentDocument = require('./models/StudentDocument');
const ClassAdvisor = require('./models/ClassAdvisor');

async function checkVisibility() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Find all staff members who are advisors
        const advisors = await User.find({ role: 'staff' });
        console.log(`Found ${advisors.length} staff members.`);
        
        for (const advisor of advisors) {
            const students = await User.find({ classAdvisor: advisor._id });
            console.log(`Advisor ${advisor.fullName} (${advisor.username}, ID: ${advisor._id}) has ${students.length} students via classAdvisor field.`);
            
            // Check ClassAdvisor collection
            const advisorRecord = await ClassAdvisor.findOne({ staff: advisor._id });
            if (advisorRecord) {
                console.log(`  -> ClassAdvisor Record Found: Dept ${advisorRecord.department}, Year ${advisorRecord.academicYear}`);
                const studentsByDeptYear = await User.find({ 
                    role: 'student', 
                    department: advisorRecord.department, 
                    academicYear: advisorRecord.academicYear 
                });
                console.log(`  -> Students in that Dept/Year: ${studentsByDeptYear.length}`);
                
                if (studentsByDeptYear.length > 0) {
                    const studentIds = studentsByDeptYear.map(s => s._id);
                    const docs = await StudentDocument.find({ studentId: { $in: studentIds } });
                    console.log(`  -> Documents for these students: ${docs.length}`);
                }
            } else {
                console.log(`  -> No ClassAdvisor record found for this staff member.`);
            }
        }

        // Find HODs and their department documents
        const hods = await User.find({ role: 'hod' });
        for (const hod of hods) {
            const docs = await StudentDocument.find({ department: hod.department });
            console.log(`HOD ${hod.fullName} for Dept ${hod.department} sees ${docs.length} documents.`);
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkVisibility();
