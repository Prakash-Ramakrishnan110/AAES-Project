const mongoose = require('mongoose');

const timelineSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['Assignment Submitted', 'Attendance Warning', 'Counseling Note', 'Marks Published', 'System Alert'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'low'
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Index for faster lookups
timelineSchema.index({ student: 1, timestamp: -1 });

module.exports = mongoose.model('Timeline', timelineSchema);
