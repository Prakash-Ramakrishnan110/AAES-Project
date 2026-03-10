const mongoose = require('mongoose');
const User = require('./models/User');
const Notification = require('./models/Notification');
const dotenv = require('dotenv');

dotenv.config();

async function simulate() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected');

        // Simulate an HOD from CSE
        const hod = await User.findOne({ role: 'hod', department: 'CSE' });
        if (!hod) {
            console.log('HOD not found');
            return;
        }
        console.log('Sender:', hod.username, hod.department);

        // Core logic from controller
        const title = 'Test Title';
        const message = 'Test Message';
        const targetGroup = 'all_students';

        let query = { isActive: true };
        query.department = hod.department;
        query.role = 'student';

        console.log('Query:', JSON.stringify(query));
        const users = await User.find(query).select('_id');
        console.log('Recipients found:', users.length);

        const recipients = users.map(u => u._id);

        if (recipients.length === 0) {
            console.log('No recipients found');
            return;
        }

        const notifications = recipients.map(userId => ({
            user: userId,
            title: `📢 ${title}`,
            message: `${message}\n\n- Sent by ${hod.fullName || hod.username}`,
            type: 'Grading',
            read: false
        }));

        console.log('Attempting insertMany...');
        const result = await Notification.insertMany(notifications);
        console.log('SUCCESS! Inserted:', result.length);

        await mongoose.disconnect();
    } catch (err) {
        console.error('SIMULATION FAILED:', err);
    }
}

simulate();
