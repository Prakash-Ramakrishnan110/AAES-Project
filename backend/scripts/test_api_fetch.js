const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const http = require('http');

async function testFetch() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const principal = await User.findOne({ role: 'principal' });
        if (!principal) throw new Error('No principal found');

        const token = jwt.sign({ id: principal._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log('Generated token for:', principal.username);

        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/ping',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };

        const req = http.request(options, (res) => {
            console.log(`STATUS: ${res.statusCode}`);
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const data = JSON.parse(body);
                    console.log('Ping Response:', data);
                } catch (e) {
                    console.log('Body is not JSON:', body);
                }
            });
        });

        req.on('error', (e) => {
            console.error(`problem with request: ${e.message}`);
        });

        req.end();

        // Wait a bit for the response
        setTimeout(() => process.exit(0), 2000);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

testFetch();
