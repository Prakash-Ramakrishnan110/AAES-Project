const axios = require('axios');

async function testLogin() {
    try {
        const response = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@aaes.com',
            password: 'password123'
        });
        console.log('Login Response:', response.data);
    } catch (error) {
        console.error('Login Error:', error.response ? error.response.data : error.message);
    }
}

testLogin();
