const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Submission = require('./models/Submission');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/aaes')
    .then(async () => {
        const subs = await Submission.aggregate([
            { $match: { fileUrl: { $nin: ['', null] } } },
            { $group: { _id: "$fileUrl", count: { $sum: 1 }, submissions: { $push: "$_id" } } },
            { $match: { count: { $gt: 1 } } }
        ]);
        console.log("Duplicate fileUrls:", JSON.stringify(subs, null, 2));
        process.exit(0);
    })
    .catch(console.error);
