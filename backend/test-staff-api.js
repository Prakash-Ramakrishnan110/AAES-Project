const axios = require('axios');

const API = 'http://localhost:5000';

const test = async () => {
    try {
        // 1. Login as HOD
        const loginRes = await axios.post(`${API}/api/auth/login`, {
            email: 'hod.cse@aaes.com',
            password: 'password123'
        });
        const token = loginRes.data.token;
        const hodDept = loginRes.data.department;
        console.log('HOD Logged In. Dept:', hodDept);

        const config = { headers: { Authorization: `Bearer ${token}` } };

        // 2. Fetch Staff
        const staffRes = await axios.get(`${API}/api/users?role=staff&department=${hodDept}&status=all`, config);
        console.log('Staff API Response:', JSON.stringify(staffRes.data, null, 2));

    } catch (err) {
        console.error('API Error:', err.response?.data || err.message);
    }
};

test();
