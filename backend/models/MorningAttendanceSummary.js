const mongoose = require('mongoose');

const morningAttendanceSummarySchema = new mongoose.Schema({
    department: {
        type: String,
        required: true
    },
    year: {
        type: String,
        required: true,
        enum: ['1st Year', '2nd Year', '3rd Year', '4th Year']
    },
    semester: {
        type: String,
        required: true
    },
    section: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    totalStudents: {
        type: Number,
        required: true
    },
    presentCount: {
        type: Number,
        required: true
    },
    absentCount: {
        type: Number,
        required: true
    },
    odCount: {
        type: Number,
        required: true
    },
    enteredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

// Prevent duplicate entry for same class and date
morningAttendanceSummarySchema.index({ department: 1, year: 1, section: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('MorningAttendanceSummary', morningAttendanceSummarySchema);
