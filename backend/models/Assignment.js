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
    type: {
        type: String,
        enum: ['theory', 'python'],
        required: true
    },
    aiEnabled: {
        type: Boolean,
        default: false
    },
    modelAnswer: {
        type: String,
        default: ''
    },
    testCases: [{
        input: String,
        output: String,
        marks: Number
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Assignment', assignmentSchema);
