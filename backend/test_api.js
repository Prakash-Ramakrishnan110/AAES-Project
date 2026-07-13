const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config({path: '.env'});

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const User = require('./models/User');
    const Assignment = require('./models/Assignment');
    
    // get hod token
    const hod = await User.findOne({role: 'hod'});
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: hod._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    
    const assignment = await Assignment.findOne({title: /dsa/i});
    console.log('Assignment ID:', assignment._id.toString());
    
    try {
        const res = await axios.get(`http://localhost:5000/api/assignments/${assignment._id}/gradebook`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('API Response:', JSON.stringify(res.data, null, 2));
    } catch (err) {
        console.error('API Error:', err.response ? err.response.data : err.message);
    }
    process.exit(0);
});
