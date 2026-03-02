const mongoose = require('mongoose');

const classAdvisorSchema = new mongoose.Schema({
    department: {
        type: String,
        required: true
    },
    academicYear: {
        type: String,
        required: true,
        enum: ['1st Year', '2nd Year', '3rd Year', '4th Year']
    },
    staff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Ensure only one advisor per department per year
classAdvisorSchema.index({ department: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model('ClassAdvisor', classAdvisorSchema);
