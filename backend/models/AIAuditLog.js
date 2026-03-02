const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    submission: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Submission',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment',
        required: true
    },
    questionIndex: {
        type: Number,
        required: true
    },
    questionText: {
        type: String,
        default: ''
    },
    promptSent: {
        type: String,
        default: ''
    },
    rawAIResponse: {
        type: String,
        default: ''
    },
    clampedScore: {
        type: Number,
        default: 0
    },
    maxScore: {
        type: Number,
        default: 0
    },
    confidenceLevel: {
        type: String,
        enum: ['high', 'medium', 'low', 'unknown'],
        default: 'unknown'
    },
    flaggedForReview: {
        type: Boolean,
        default: false
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('AIAuditLog', auditLogSchema);
