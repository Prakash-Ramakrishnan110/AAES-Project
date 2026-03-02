const mongoose = require('mongoose');

const mentorshipInteractionSchema = new mongoose.Schema({
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
    interactionType: {
        type: String,
        enum: ['Academic', 'Attendance', 'Personal', 'General'],
        required: true
    },
    summary: {
        type: String,
        required: true
    },
    actionPlan: {
        type: String,
        required: true
    },
    followUpDate: {
        type: Date
    },
    riskLevelAtTimeOfInteraction: {
        type: String,
        enum: ['Green', 'Yellow', 'Red', 'Unknown'],
        default: 'Unknown'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('MentorshipInteraction', mentorshipInteractionSchema);
