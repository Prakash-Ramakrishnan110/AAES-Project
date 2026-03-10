const mongoose = require('mongoose');
const { recalculateRiskForStudent } = require('./services/riskEngine');
const User = require('./models/User');

async function syncRisk() {
    try {
        const mongoURI = 'mongodb://127.0.0.1:27017/aaes';
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        const students = await User.find({ role: 'student', isActive: true });
        console.log(`\nTriggering recalculation for ${students.length} active students...`);

        for (const s of students) {
            console.log(`- Recalculating for ${s.fullName} (@${s.username})`);
            // The service uses setImmediate, so we just call it.
            // We'll wait a bit at the end to let them finish.
            recalculateRiskForStudent(s._id, s.semester, s.academicYear);
        }

        console.log('\nWait 5s for calculations to finish...');
        await new Promise(r => setTimeout(r, 5000));

        await mongoose.disconnect();
        console.log('Done.');
    } catch (err) {
        console.error('Error:', err);
    }
}

syncRisk();
