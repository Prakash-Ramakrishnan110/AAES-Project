const mongoose = require('mongoose');
const axios = require('axios');

mongoose.connect('mongodb://127.0.0.1:27017/aaes');

mongoose.connection.once('open', async () => {
    const User = require('./models/User');

    // Get Prakash's user ID to generate a test token
    const prakash = await User.findOne({ username: /prakash/i }).select('_id username');
    console.log('Prakash ID:', prakash?._id);

    // Log in as Prakash to get a JWT token
    try {
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            username: prakash.username,
            password: 'student@123' // Try common password
        });
        const token = loginRes.data.token;
        console.log('Login SUCCESS, token received');

        // Now fetch study materials as Prakash
        const matRes = await axios.get('http://localhost:5000/api/study-materials', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('MATERIALS RETURNED:', matRes.data.length, matRes.data.map(m => m.title));
    } catch (err) {
        console.log('Login/fetch error:', err.response?.data || err.message);
    }

    mongoose.disconnect();
});
