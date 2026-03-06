const mongoose = require('mongoose');
require('dotenv').config();
const { recalculateRiskForStudent } = require('./services/riskEngine');

async function testRiskEngine() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Just trigger it and wait for the setImmediate to finish or log errors
        console.log('Triggering risk recalculation...');
        // Using a dummy ID or a real one from previous tests
        const dummyId = '699f2b15a94de0bf3866199f';
        await recalculateRiskForStudent(dummyId);

        console.log('Recalculation triggered. Check console for [RiskEngine] logs.');

        // Wait a bit for the async setImmediate to run
        setTimeout(() => {
            console.log('Test finished.');
            process.exit(0);
        }, 3000);

    } catch (error) {
        console.error('Test Failed:', error);
        process.exit(1);
    }
}

testRiskEngine();
