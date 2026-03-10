const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function diagnose() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const hods = await User.find({ role: 'hod' });
        const staff = await User.find({ role: 'staff' });
        const principals = await User.find({ role: 'principal' });

        console.log(`HODs count: ${hods.length}`);
        console.log(`Staff count: ${staff.length}`);
        console.log(`Principals count: ${principals.length}`);

        if (hods.length === 0) {
            console.log('WARNING: No HODs found. Directory might look empty.');
        }
        if (staff.length === 0) {
            console.log('WARNING: No Staff found. Directory might look empty.');
        }

        const staffDistribution = await User.aggregate([
            { $match: { role: 'staff' } },
            { $group: { _id: '$department', count: { $sum: 1 } } }
        ]);
        console.log('Staff Distribution:', staffDistribution);

        process.exit(0);
    } catch (err) {
        console.error('Diagnosis failed:', err);
        process.exit(1);
    }
}

diagnose();
