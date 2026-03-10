const mongoose = require('mongoose');

const classActivityLogSchema = new mongoose.Schema({
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    department: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    period: {
        type: Number,
        required: true
    },
    topicCovered: {
        type: String,
        required: true
    },
    remarks: {
        type: String
    }
}, { timestamps: true });

// Prevent duplicate logs for same period on same day
classActivityLogSchema.index({ staffId: 1, date: 1, period: 1 }, { unique: true });

module.exports = mongoose.model('ClassActivityLog', classActivityLogSchema);
