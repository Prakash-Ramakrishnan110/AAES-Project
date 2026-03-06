const mongoose = require('mongoose');
const axios = require('axios');

async function testApi() {
    try {
        console.log('Testing Governance API...');
        // We can't easily mock the full auth/session here without more setup,
        // but we can check if the code at least parses and the mongoose import is present.
        const governanceController = require('./controllers/governanceController');
        console.log('Controller loaded successfully.');

        if (governanceController.getAdvisorDashboard) {
            console.log('getAdvisorDashboard function exists.');
        } else {
            console.error('getAdvisorDashboard function NOT found!');
        }
    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    }
}

testApi();
