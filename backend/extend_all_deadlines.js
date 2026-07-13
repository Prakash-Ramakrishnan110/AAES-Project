const mongoose = require('mongoose');
const Assignment = require('./models/Assignment');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const checkOverdue = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aaes');
        const now = new Date();
        const overdue = await Assignment.find({ deadline: { $lt: now } });
        console.log('Overdue assignments count:', overdue.length);
        if (overdue.length > 0) {
            console.log('Overdue titles:', overdue.map(a => a.title).join(', '));
            // Update all overdue to next week for dev testing
            const result = await Assignment.updateMany(
                { deadline: { $lt: now } },
                { $set: { deadline: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) } }
            );
            console.log(`Updated ${result.modifiedCount} overdue assignments.`);
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkOverdue();
