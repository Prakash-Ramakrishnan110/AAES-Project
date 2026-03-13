const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['Present', 'Absent', 'Leave', 'OD'],
        required: true
    },
    reason: {
        type: String,
        default: ''
    }
}, { _id: false });

const attendanceSchema = new mongoose.Schema({
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: function() { return !this.isMorning; }
    },
    department: {
        type: String,
        required: function() { return this.isMorning; }
    },
    academicYear: {
        type: String,
        required: function() { return this.isMorning; }
    },
    isMorning: {
        type: Boolean,
        default: false
    },
    date: {
        type: Date,
        required: true
    },
    period: {
        type: Number,
        required: true,
        min: 0,
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

// Prevent duplicate attendance
// For subjects: subject + date + period
// For morning: department + academicYear + date + period (period 0)
attendanceSchema.index({ subject: 1, date: 1, period: 1 }, { 
    unique: true, 
    partialFilterExpression: { isMorning: false } 
});
attendanceSchema.index({ department: 1, academicYear: 1, date: 1, period: 1 }, { 
    unique: true, 
    partialFilterExpression: { isMorning: true } 
});

module.exports = mongoose.model('Attendance', attendanceSchema);
