const axios = require('axios');

async function testProfile() {
    try {
        // 1. Get Token
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@aaes.com',
            password: 'password123'
        });
        const token = loginRes.data.token;
        console.log('Logged in, token received.');

        // 2. Get Profile
        const profileRes = await axios.get('http://localhost:5000/api/profile/me', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Profile retrieved:', profileRes.data.username);

        // 3. Update Profile with Preferences
        const updateRes = await axios.put('http://localhost:5000/api/profile/me', {
            fullName: 'System Administrator Updated',
            preferences: {
                aiPulse: true,
                darkMode: true,
                notifications: true,
                auditLogging: true,
                timezone: 'Asia/Kolkata (GMT+5:30)',
                language: 'English (US)'
            }
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Update Success:', updateRes.data.fullName);
        console.log('Updated Preferences:', updateRes.data.preferences);

    } catch (error) {
        console.error('Test Failed:', error.response ? error.response.data : error.message);
        if (error.response && error.response.data.error) {
            console.error('Stack:', error.response.data.error);
        }
    }
}

testProfile();
