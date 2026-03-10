const mongoose = require('mongoose');

const classTimetableSchema = new mongoose.Schema({
    department: {
        type: String,
        required: true
    },
    semester: {
        type: Number,
        required: true
    },
    subjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    day: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        required: true
    },
    period: {
        type: Number,
        required: true
    },
    startTime: {
        type: String, // format "09:00 AM"
        required: true
    },
    endTime: {
        type: String, // format "10:00 AM"
        required: true
    }
}, { timestamps: true });

// Ensure a staff member isn't double-booked in the same period
classTimetableSchema.index({ staffId: 1, day: 1, period: 1 }, { unique: true });

module.exports = mongoose.model('ClassTimetable', classTimetableSchema);
