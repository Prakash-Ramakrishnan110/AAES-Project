const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function testControllerLogic() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        console.log('Testing HODs fetch...');
        const hods = await User.find({ role: 'hod' }).select('fullName username email department lastLogin profileImage academicYear');
        console.log('HODs result:', hods.length);

        console.log('Testing Staff fetch...');
        const staff = await User.find({ role: 'staff' }).select('fullName username email department lastLogin profileImage academicYear');
        console.log('Staff result:', staff.length);

        console.log('Testing Distribution aggregation...');
        const staffDistribution = await User.aggregate([
            { $match: { role: 'staff' } },
            { $group: { _id: '$department', count: { $sum: 1 } } }
        ]);
        console.log('Distribution result:', staffDistribution);

        const finalData = {
            hods,
            staff,
            distribution: (staffDistribution || []).map(d => ({ department: d._id, count: d.count }))
        };

        console.log('Final Data Structure check:');
        console.log('hods is array:', Array.isArray(finalData.hods));
        console.log('staff is array:', Array.isArray(finalData.staff));
        console.log('distribution is array:', Array.isArray(finalData.distribution));

        process.exit(0);
    } catch (err) {
        console.error('Logic test failed:', err);
        process.exit(1);
    }
}

testControllerLogic();
