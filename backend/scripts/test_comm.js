const mongoose = require('mongoose');
const User = require('./models/User');
const Notification = require('./models/Notification');
const dotenv = require('dotenv');

dotenv.config();

async function testCommunications() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Find any student
        const student = await User.findOne({ role: 'student' });
        if (!student) {
            console.log('No student found in database to test with.');
            return;
        }

        console.log(`Found student for testing: ${student.fullName} (${student.username})`);

        // Find HOD CSE
        const hod = await User.findOne({ role: 'hod', department: 'CSE' });
        if (!hod) {
            console.log('HOD not found');
            return;
        }

        console.log(`Found HOD: ${hod.fullName} (${hod._id})`);

        // Create a manual notification (simulating sendAnnouncement logic)
        const testNotification = await Notification.create({
            user: student._id,
            title: '📢 1st Year CSE Meetup',
            message: 'All 1st year CSE students are requested to attend the meeting at 4 PM.\n\n- Sent by ' + hod.fullName,
            type: 'Grading',
            read: false
        });

        console.log('Test notification created:', testNotification._id);

        // Verify it's there
        const found = await Notification.findById(testNotification._id);
        if (found) {
            console.log('Verification successful: Notification exists in DB');
        } else {
            console.log('Verification failed: Notification not found in DB');
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

testCommunications();
