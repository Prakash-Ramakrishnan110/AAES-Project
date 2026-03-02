const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    section: {
        type: String,
        default: 'All' // 'All' or specific section like 'A', 'B'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    maxMarks: {
        type: Number,
        required: true
    },
    deadline: {
        type: Date,
        required: true
    },
    submissionType: {
        type: String,
        enum: ['handwritten', 'document', 'ppt', 'quiz', 'code', 'seminar'],
        required: true
    },
    formatConfig: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    submissionsEnabled: {
        type: Boolean,
        default: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Assignment', assignmentSchema);
