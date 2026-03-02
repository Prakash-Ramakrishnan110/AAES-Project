const mongoose = require('mongoose');

const escalationSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    mentor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    advisor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    department: {
        type: String,
        required: true
    },
    academicYear: {
        type: String,
        required: true
    },
    semester: { type: String },

    // What triggered this escalation
    reason: { type: String, default: '' },
    issueSummary: {
        type: String,
        required: true
    },

    // Multi-level escalation state
    currentLevel: {
        type: String,
        enum: ['Mentor', 'Advisor', 'HOD'],
        default: 'Mentor'
    },
    consecutiveRedCount: { type: Number, default: 2 },
    triggeredAt: { type: Date, default: Date.now },

    status: {
        type: String,
        enum: ['Open', 'Under Review', 'Closed'],
        default: 'Open'
    },
    resolved: { type: Boolean, default: false },

    hodDirectives: [{
        note: String,
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        date: { type: Date, default: Date.now }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    closedAt: {
        type: Date
    }
});

module.exports = mongoose.model('Escalation', escalationSchema);

