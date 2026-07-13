const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
    isMorning: { type: Boolean, default: false },
    department: { type: String },
    date: { type: Date },
    academicYear: { type: String },
    semester: { type: String },
    records: [{
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, enum: ['Present', 'Absent', 'Late', 'Excused'] }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
