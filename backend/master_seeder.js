const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Department = require('./models/Department');
const Subject = require('./models/Subject');
const Assignment = require('./models/Assignment');
const Submission = require('./models/Submission');
const ClassAdvisor = require('./models/ClassAdvisor');

const mongoUri = 'mongodb://127.0.0.1:27017/aaes';

async function seed() {
    try {
        await mongoose.connect(mongoUri);
        console.log('Connected to DB');

        // Clear existing
        await User.deleteMany({});
        await Department.deleteMany({});
        await Subject.deleteMany({});
        await Assignment.deleteMany({});
        await Submission.deleteMany({});
        await ClassAdvisor.deleteMany({});
        console.log('Cleared existing data');

        const salt = await bcrypt.genSalt(10);
        const hashedPW = await bcrypt.hash('password123', salt);

        // 1. Create Departments
        const deptNames = [
            'Computer Science & Engineering',
            'Information Technology',
            'Electronics & Communication',
            'Mechanical Engineering',
            'Civil Engineering',
            'Electrical & Electronics',
            'Artificial Intelligence & Data Science'
        ];
        
        const depts = [];
        for (const name of deptNames) {
            const d = await Department.create({ name, description: `Department of ${name}` });
            depts.push(d);
        }
        console.log(`Created ${depts.length} departments`);

        // 2. Create Admin
        await User.create({
            username: 'admin',
            fullName: 'System Admin',
            email: 'admin@aaes.com',
            password: 'password123',
            role: 'admin',
            department: 'Administration',
            isActive: true
        });

        // 3. Create HODs for each department
        for (const d of depts) {
            const hod = await User.create({
                username: `hod_${d.name.split(' ')[0].toLowerCase()}`,
                fullName: `HOD ${d.name}`,
                email: `hod.${d.name.split(' ')[0].toLowerCase()}@aaes.com`,
                password: 'password123',
                role: 'hod',
                department: d.name,
                isActive: true
            });
            d.hod = hod._id;
            await d.save();
        }
        console.log('Created HODs');

        // 4. Create Staff (3 per dept)
        const staffList = [];
        for (const d of depts) {
            for (let i = 1; i <= 3; i++) {
                const s = await User.create({
                    username: `staff_${d.name.split(' ')[0].toLowerCase()}_${i}`,
                    fullName: `Staff ${i} - ${d.name}`,
                    email: `staff${i}.${d.name.split(' ')[0].toLowerCase()}@aaes.com`,
                    password: 'password123',
                    role: 'staff',
                    department: d.name,
                    isActive: true,
                    staffId: `STAFF_${d.name.split(' ')[0].toUpperCase()}_${i}`
                });
                staffList.push(s);
            }
        }
        console.log(`Created ${staffList.length} staff members`);

        // 5. Create Students (10 per dept)
        for (const d of depts) {
            for (let i = 1; i <= 10; i++) {
                await User.create({
                    username: `student_${d.name.split(' ')[0].toLowerCase()}_${i}`,
                    fullName: `Student ${i} - ${d.name}`,
                    email: `student${i}.${d.name.split(' ')[0].toLowerCase()}@aaes.com`,
                    password: 'password123',
                    role: 'student',
                    department: d.name,
                    isActive: true,
                    registerNumber: `21${d.name.split(' ')[0].toUpperCase()}${i.toString().padStart(3, '0')}`,
                    semester: '5',
                    batch: '2021-2025'
                });
            }
        }
        console.log('Created Students');
        
        // 6. Create Canonical Demo Users for Frontend
        const demoUsers = [
            {
                username: 'hod_cse',
                fullName: 'HOD CSE',
                email: 'hod.cse@aaes.com',
                password: 'password123',
                role: 'hod',
                department: 'Computer Science & Engineering',
                isActive: true
            },
            {
                username: 'staff_demo',
                fullName: 'Staff User',
                email: 'staff@aaes.com',
                password: 'password123',
                role: 'staff',
                department: 'Computer Science & Engineering',
                isActive: true
            },
            {
                username: 'student_demo',
                fullName: 'Student User',
                email: 'student@aaes.com',
                password: 'password123',
                role: 'student',
                department: 'Computer Science & Engineering',
                isActive: true,
                registerNumber: '21CSE000',
                semester: '5',
                batch: '2021-2025'
            },
            {
                username: 'principal',
                fullName: 'College Principal',
                email: 'principal@aaes.com',
                password: 'password123',
                role: 'principal',
                department: 'Administration',
                isActive: true
            },
            {
                username: 'lab_assistant',
                fullName: 'Lab Assistant',
                email: 'lab@aaes.com',
                password: 'lab123', // Matches Frontend
                role: 'lab-assistant',
                department: 'Computer Science & Engineering',
                isActive: true
            }
        ];

        for (const u of demoUsers) {
            await User.create(u);
        }
        console.log('Created Canonical Demo Users');

        // 7. Create Demo Subjects & Assignments
        const staffDemo = await User.findOne({ username: 'staff_demo' });
        const studentDemo = await User.findOne({ username: 'student_demo' });

        if (staffDemo && studentDemo) {
            const subjects = [
                { name: 'Web Technology', code: 'CS3501', department: 'Computer Science & Engineering', semester: '5', academicYear: '2021-2025', staffId: staffDemo._id, staff: [staffDemo._id] },
                { name: 'Theory of Computation', code: 'CS3502', department: 'Computer Science & Engineering', semester: '5', academicYear: '2021-2025', staffId: staffDemo._id, staff: [staffDemo._id] },
                { name: 'Computer Networks', code: 'CS3503', department: 'Computer Science & Engineering', semester: '5', academicYear: '2021-2025', staffId: staffDemo._id, staff: [staffDemo._id] }
            ];

            for (const s of subjects) {
                const sub = await Subject.create(s);
                
                // Create an assignment for each subject
                await Assignment.create({
                    title: `${sub.name} - Unit I Assessment`,
                    description: `This is the first unit assessment for ${sub.name}.`,
                    subjectId: sub._id,
                    department: sub.department,
                    semester: sub.semester,
                    createdBy: staffDemo._id,
                    type: 'handwritten',
                    submissionType: 'handwritten',
                    maxMarks: 50,
                    totalMarks: 50,
                    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                    questions: [
                        { text: 'Explain the architecture of ' + sub.name, marks: 10 },
                        { text: 'Discuss the key concepts of Unit I', marks: 10 },
                        { text: 'Write a short note on recent trends', marks: 10 }
                    ]
                });
            }
            console.log('Created Demo Subjects and Assignments');
        }

        console.log('--- SEEDING COMPLETE ---');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seed();
