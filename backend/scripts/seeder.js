const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const ClassAdvisor = require('../models/ClassAdvisor');
const Subject = require('../models/Subject');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedUsers = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aaes';
        await mongoose.connect(mongoUri);
        console.log('MongoDB Connected to:', mongoUri);

        // Clean existing data
        await User.deleteMany();
        await ClassAdvisor.deleteMany();
        await Subject.deleteMany();
        await Assignment.deleteMany();
        await Submission.deleteMany();
        console.log('Existing data cleared.');

        const userData = [
            {
                username: 'admin',
                fullName: 'System Administrator',
                email: 'admin@aaes.com',
                password: 'password123',
                role: 'admin',
                department: 'Administration'
            },
            {
                username: 'hod_cse',
                fullName: 'HOD Computer Science',
                email: 'hod.cse@aaes.com',
                password: 'password123',
                role: 'hod',
                department: 'CSE'
            },
            {
                username: 'staff_user',
                fullName: 'Dr. Ramesh Kumar',
                email: 'staff@aaes.com',
                password: 'password123',
                role: 'staff',
                department: 'CSE',
                academicYear: '2023-2024'
            },
            {
                username: 'student_user',
                fullName: 'Arjun Prakash',
                registerNumber: '21CSE042',
                email: 'student@aaes.com',
                password: 'password123',
                role: 'student',
                department: 'CSE',
                academicYear: '2023-2024',
                semester: '5'
            },
        ];

        // Seed Users one by one to trigger pre-save hook
        const createdUsers = [];
        for (const u of userData) {
            const user = await User.create(u);
            createdUsers.push(user);
        }
        console.log('Users created with pre-save hashing.');

        const adminUser = createdUsers.find(u => u.role === 'admin');
        const staffUser = createdUsers.find(u => u.role === 'staff');
        const studentUser = createdUsers.find(u => u.role === 'student');

        // Seed Class Advisor Assignment
        await ClassAdvisor.create({
            department: 'CSE',
            academicYear: '3rd Year',
            staff: staffUser._id,
            assignedBy: adminUser._id
        });
        console.log('Class Advisor created.');

        // Seed Subject
        const subject = await Subject.create({
            name: 'Cloud Computing & Virtualization',
            code: 'CS8791',
            department: 'CSE',
            semester: '5',
            academicYear: '2023-2024',
            staff: [staffUser._id],
            staffId: staffUser._id
        });
        console.log('Subject created.');

        // Seed Assignment
        const assignment = await Assignment.create({
            title: 'Virtualization & Docker Principles',
            description: 'Analyze the impact of containerization on modern cloud architecture.',
            subjectId: subject._id,
            department: 'CSE',
            semester: '5',
            section: 'All',
            createdBy: staffUser._id,
            maxMarks: 10,
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            type: 'handwritten',
            formatConfig: {
                assignmentRubric: {
                    understandingMarks: 2.5,
                    contentMarks: 2.5,
                    organizationMarks: 2,
                    presentationMarks: 1.5,
                    originalityMarks: 1.5
                },
                creationMode: 'manual'
            }
        });
        console.log('Assignment created.');

        // Seed Submission
        await Submission.create({
            studentId: studentUser._id,
            assignmentId: assignment._id,
            fileHash: 'sha256:7f...3a',
            fileUrl: '/uploads/sample-assignment.pdf',
            extractedText: 'Virtualization allows sharing of resources... Docker uses containers to isolate applications...',
            correctedText: 'Virtualization allows sharing of resources... Docker uses containers to isolate applications...',
            similarityScore: 12,
            confidenceScore: 94,
            aiResultStatus: 'verified',
            aiConfidence: 0.94,
            reasoning: 'The student demonstrates a strong grasp of container isolation principles.',
            status: 'graded',
            marks: 9,
            submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            isVerified: true
        });
        console.log('Submission created.');

        console.log('DATABASE SEEDED SUCCESSFULLY!');
        process.exit();
    } catch (error) {
        console.error('SEEDING ERROR:', error);
        process.exit(1);
    }
};

seedUsers();
