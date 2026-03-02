const mongoose = require('mongoose');

const mentorStudentMapSchema = new mongoose.Schema({
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    academicYear: { type: String, required: true },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Ensure a student only has one active mentor per academic year
mentorStudentMapSchema.index({ student: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model('MentorStudentMap', mentorStudentMapSchema);
