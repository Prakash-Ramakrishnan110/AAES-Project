const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const Assignment = require('./models/Assignment');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aaes').then(async () => {

    const ass = await Assignment.findOne({ title: /Web App/i });
    if (!ass) {
        console.log("Not found assignment");
        process.exit();
    }

    console.log("Assignment:", ass.title, ass.subject);
    const sub = await Subject.findById(ass.subject);
    console.log("Subject:", sub);

    process.exit(0);
});
