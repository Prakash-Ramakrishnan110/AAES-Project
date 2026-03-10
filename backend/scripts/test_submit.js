const axios = require('axios');

async function testSubmit() {
    try {
        const formData = {
            assignmentId: '69a003b534c37424038826a8',
            answers: 'Test answer',
        };
        // For testing we will just try a post request without token, expecting a 401. 
        // If we get "Submission deadline passed" it means the auth isn't firing or this route is doing something else.
        // Actually we need a token to hit /api/submissions. 
        console.log("Creating test user to grab token...");
    } catch (err) {
        console.error(err.response ? err.response.data : err.message);
    }
}
testSubmit();
