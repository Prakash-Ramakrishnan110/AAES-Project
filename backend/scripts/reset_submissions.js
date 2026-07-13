const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');

dotenv.config();

const resetSubmissions = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/aaes');
        console.log('MongoDB Connected');

        // Delete all submissions
        const res = await Submission.deleteMany();
        console.log(`Deleted ${res.deletedCount} submissions.`);

        // Optionally, reset assignment status if needed, but usually clearing submissions is enough
        // so that students can re-submit and teachers see the empty gradebook.
        
        console.log('Submission data reset complete! You can now start fresh testing.');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error}`);
        process.exit(1);
    }
};

resetSubmissions();
