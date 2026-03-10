require('dotenv').config();
const mongoose = require('mongoose');
const Assignment = require('./models/Assignment');

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aaes')
    .then(async () => {
        const assignments = await Assignment.find().sort({ createdAt: -1 }).limit(5);
        console.log("Current System Time UTC:", new Date().toISOString());
        console.log("Current System Time Local:", new Date().toString());
        assignments.forEach(a => {
            console.log(`\nID: ${a._id}`);
            console.log(`Title: ${a.title}`);
            console.log(`Deadline (UTC): ${new Date(a.deadline).toISOString()}`);
            console.log(`Deadline (Local): ${new Date(a.deadline).toString()}`);
            console.log(`Is Deadline Passed?: ${new Date() > new Date(a.deadline)}`);
            console.log(`Late Allowed Config: ${JSON.stringify(a.formatConfig?.rules || {})}`);
        });
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
