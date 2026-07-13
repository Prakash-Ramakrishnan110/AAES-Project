const mongoose = require('mongoose');
const dot = require('dotenv');
dot.config();
const Subject = require('./models/Subject');

async function assign() {
    await mongoose.connect(process.env.MONGO_URI);
    const staffId = '69c3931ebaadb63676ab999a'; // staff_demo
    const subjectCode = 'ccs331'; // Web design
    
    const subject = await Subject.findOne({ code: subjectCode });
    if (!subject) {
        console.log('Subject not found');
        process.exit(1);
    }
    
    subject.staffId = staffId;
    if (!subject.staff.some(id => id.toString() === staffId)) {
        subject.staff.push(staffId);
    }
    
    await subject.save();
    console.log('Manually assigned staff_demo to subject ccs331');
    process.exit(0);
}

assign();
