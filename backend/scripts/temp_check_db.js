const mongoose = require('mongoose');
const User = require('./models/User');
const ClassAdvisor = require('./models/ClassAdvisor');
const Subject = require('./models/Subject');

const check = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/aaes');
        const staff = await User.findOne({ email: 'staff@aaes.com' });
        if (!staff) {
            console.log('Staff user not found');
            process.exit();
        }
        console.log('Staff User ID:', staff._id);

        const advisor = await ClassAdvisor.findOne({ staff: staff._id });
        console.log('Class Advisor Entry:', advisor);

        const subjects = await Subject.find({ staff: staff._id });
        console.log('Assigned Subjects Count:', subjects.length);
        subjects.forEach(s => console.log(`- ${s.name} (${s.code}) [${s.department}]`));

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

check();
