const mongoose = require('mongoose');
const dot = require('dotenv');
dot.config();
const Subject = require('./models/Subject');

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const staffId = '69c3931ebaadb63676ab999a';
    const subjects = await Subject.find({ 
        $or: [
            { staffId: staffId }, 
            { staff: staffId }
        ] 
    });
    console.log(JSON.stringify(subjects, null, 2));
    process.exit(0);
}

check();
