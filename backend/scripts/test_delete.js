const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testDelete() {
    try {
        // We need a token. I'll assume one for testing or just check if the route is reachable.
        // Actually, without a valid token and a real ID, I can't test much.
        // But I can check if the route returns 401/404 as expected rather than 500.
        console.log('Testing Deletion Route...');
        try {
            const res = await axios.delete(`${API_URL}/timetable/activity-log/un-valid-id`);
            console.log('Response:', res.status, res.data);
        } catch (err) {
            console.log('Error Response:', err.response?.status, err.response?.data);
        }
    } catch (e) {
        console.error('Test script failed:', e);
    }
}

testDelete();
