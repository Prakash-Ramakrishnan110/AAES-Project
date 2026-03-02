const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['Present', 'Absent'],
        required: true
    }
}, { _id: false });

const attendanceSchema = new mongoose.Schema({
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    period: {
        type: Number,
        required: true,
        min: 1,
        max: 8
    },
    markedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lockedAt: {
        type: Date,
        default: Date.now
    },
    records: [attendanceRecordSchema]
}, { timestamps: true });

// Prevent duplicate attendance for same subject/date/period
attendanceSchema.index({ subject: 1, date: 1, period: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
