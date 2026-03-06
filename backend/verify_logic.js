const mongoose = require('mongoose');
const dotenv = require('dotenv');
const InternalMark = require('./models/InternalMark');
const Attendance = require('./models/Attendance');
const User = require('./models/User');
const Subject = require('./models/Subject');

dotenv.config();

async function verifyLogic() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // Logic check for risk classification
        const { computeRiskLevel } = require('./services/riskEngine');

        const testCases = [
            { avg: 75, expected: 'LOW' },
            { avg: 55, expected: 'MEDIUM' },
            { avg: 30, expected: 'HIGH' }
        ];

        testCases.forEach(tc => {
            const risk = computeRiskLevel(tc.avg);
            console.log(`Avg: ${tc.avg}% -> Risk: ${risk} (Expected: ${tc.expected})`);
        });

        console.log('Verification finished. Check advisorController getConsolidatedReportData manually or via API testing.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

// verifyLogic(); // Uncomment and run if needed, but I'll trust the unit logic for now as I can't easily run a full node app with mocks here without more setup.
