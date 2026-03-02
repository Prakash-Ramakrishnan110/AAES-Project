const mongoose = require('mongoose');

const mentorHistorySchema = new mongoose.Schema({
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
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedAt: {
        type: Date,
        default: Date.now,
        required: true
    },
    removedAt: {
        type: Date
    },
    status: {
        type: String,
        enum: ['Active', 'Previous'],
        default: 'Active',
        required: true
    }
}, { timestamps: true });

// Optional indexes for speed
mentorHistorySchema.index({ student: 1, status: 1 });
mentorHistorySchema.index({ mentor: 1 });

module.exports = mongoose.model('MentorHistory', mentorHistorySchema);
