const mongoose = require('mongoose');

const internalMarkSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    academicYear: {
        type: String,
        required: true
    },
    semester: {
        type: String,
        required: true
    },
    componentMarks: [{
        componentName: { type: String, required: true },
        maxMarks: { type: Number, required: true },
        marksObtained: { type: Number, required: true }
    }],
    totalInternalMarks: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Ensure one record per student per subject per semester
internalMarkSchema.index({ student: 1, subject: 1, academicYear: 1, semester: 1 }, { unique: true });

module.exports = mongoose.model('InternalMark', internalMarkSchema);
