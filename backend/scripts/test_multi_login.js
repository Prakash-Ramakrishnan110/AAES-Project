const axios = require('axios');

async function testLogins() {
    const creds = [
        { email: 'admin@aaes.com', password: 'password123', label: 'Admin Email' },
        { email: 'admin', password: 'password123', label: 'Admin Username' },
        { email: 'hod.cse@aaes.com', password: 'password123', label: 'HOD Email' },
        { email: 'hod_cse', password: 'password123', label: 'HOD Username' }
    ];

    for (const cred of creds) {
        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', {
                email: cred.email,
                password: cred.password
            });
            console.log(`[PASS] ${cred.label}: Logged in as ${response.data.username} (${response.data.role})`);
        } catch (error) {
            console.error(`[FAIL] ${cred.label}:`, error.response ? error.response.data : error.message);
        }
    }
}

testLogins();
