require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aaes')
    .then(async () => {
        const db = mongoose.connection.db;
        await db.collection('assignments').updateMany({}, { $set: { deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } });
        console.log('Successfully updated all deadlines to 7 days from now');
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
