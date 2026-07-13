const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Submission = require('./models/Submission');

async function checkText() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const sub = await Submission.findOne({ _id: '69c4023832d23873d57f6369' });
        if (!sub) { console.log('SUBMISSION NOT FOUND'); process.exit(0); }
        console.log(`ID: ${sub._id}`);
        console.log(`Marks: ${sub.marks}`);
        console.log(`Feedback: ${sub.feedback}`);
        console.log(`Text: ${sub.extractedText ? sub.extractedText.substring(0, 100) + '...' : 'NONE'}`);
        process.exit(0);
    } catch (err) {
        process.exit(1);
    }
}
checkText();
