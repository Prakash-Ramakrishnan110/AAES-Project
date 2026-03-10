const mongoose = require('mongoose');
const User = require('./models/User');
const ClassAdvisor = require('./models/ClassAdvisor');
const governanceController = require('./controllers/governanceController');

const mongoURI = 'mongodb://localhost:27017/aaes';

async function testController() {
    try {
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        const user = await User.findOne({ username: /jaseenash/i });
        if (!user) {
            console.log('User jaseenash not found');
            return;
        }

        const req = {
            user: { id: user._id }
        };
        const res = {
            status: function (s) { this.statusCode = s; return this; },
            json: function (j) {
                console.log('Response Status:', this.statusCode || 200);
                console.log('Response Body:', JSON.stringify(j, null, 2));
            }
        };

        console.log('Executing getAdvisorDashboard...');
        await governanceController.getAdvisorDashboard(req, res);

    } catch (error) {
        console.error('Test script crashed:', error);
    } finally {
        await mongoose.disconnect();
    }
}

testController();
