const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Assignment = require('./models/Assignment');

const updateDeadline = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/aaes');
        console.log('Connected to MongoDB');

        const assignmentId = '69c4023832d23873d57f6369';
        const assignment = await Assignment.findById(assignmentId);

        if (!assignment) {
            console.log('Assignment not found');
            process.exit(0);
        }

        console.log('Current Deadline:', assignment.deadline);
        
        const newDeadline = new Date();
        newDeadline.setDate(newDeadline.getDate() + 7); // Set to 7 days from now
        
        assignment.deadline = newDeadline;
        await assignment.save();

        console.log('Updated Deadline to:', newDeadline);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

updateDeadline();
