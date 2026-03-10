const mongoose = require('mongoose');
const InternalPattern = require('./models/InternalPattern');

async function checkPatterns() {
    try {
        const mongoURI = 'mongodb://127.0.0.1:27017/aaes';
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        const patterns = await InternalPattern.find({});
        console.log('\n--- INTERNAL PATTERNS ---');
        patterns.forEach(p => {
            console.log(`ID: ${p._id}, Dept: [${p.department}], Year: [${p.academicYear}], Sem: [${p.semester}]`);
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkPatterns();
