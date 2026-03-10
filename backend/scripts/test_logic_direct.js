const mongoose = require('mongoose');
const User = require('./models/User');
const governanceController = require('./controllers/governanceController');
require('dotenv').config();

async function testLogicDirectly() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const req = {};
        const res = {
            json: function (j) {
                console.log('Direct Mock Response Keys:', Object.keys(j));
                if (j.staff) console.log('Staff count:', j.staff.length);
                if (j.allStaff) console.log('allStaff count:', j.allStaff.length);
            }
        };

        console.log('Executing getPrincipalStaff directly...');
        await governanceController.getPrincipalStaff(req, res);

        process.exit(0);
    } catch (error) {
        console.error('Logic test crashed:', error);
        process.exit(1);
    }
}

testLogicDirectly();
