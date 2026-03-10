const mongoose = require('mongoose');
const MentorshipQuery = require('./models/MentorshipQuery');
const User = require('./models/User');

async function checkQueries() {
    try {
        const mongoURI = 'mongodb://127.0.0.1:27017/aaes';
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        const student = await User.findOne({ fullName: /Prakash RR/i });
        const advisor = await User.findOne({ username: /jaseenash/i });

        if (!student || !advisor) {
            console.log('Could not find student or advisor');
            return;
        }

        console.log(`Advisor ID: ${advisor._id} (${advisor.username})`);
        console.log(`Student ID: ${student._id} (${student.fullName})`);

        const queries = await MentorshipQuery.find({ student: student._id });
        console.log(`\nFound ${queries.length} queries for ${student.fullName}:`);

        queries.forEach(q => {
            console.log(`- ID: ${q._id}`);
            console.log(`  Message: "${q.message}"`);
            console.log(`  Mentor ID in Query: ${q.mentor}`);
            console.log(`  Match with Advisor: ${q.mentor.toString() === advisor._id.toString()}`);
            console.log(`  Status: ${q.status}`);
            console.log('---');
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkQueries();
