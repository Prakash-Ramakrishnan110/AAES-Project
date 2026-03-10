const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User'); // Must be loaded for populate
const Submission = require('./models/Submission');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/aaes')
    .then(async () => {
        const subs = await Submission.find({ fileUrl: { $nin: ['', null] } })
            .populate('student', 'username')
            .sort({ submittedAt: -1 })
            .limit(10)
            .select('fileUrl student submittedAt');
        console.log(JSON.stringify(subs, null, 2));
        process.exit(0);
    })
    .catch(console.error);
