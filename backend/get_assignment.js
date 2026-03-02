require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aaes')
    .then(async () => {
        // get raw collection
        const db = mongoose.connection.db;
        const assignment = await db.collection('assignments').findOne({ _id: new mongoose.Types.ObjectId('69a003b534c37424038826a8') });
        console.log(JSON.stringify(assignment, null, 2));
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
