const mongoose = require('mongoose');

const componentMarkSchema = new mongoose.Schema({
    componentName: { type: String, required: true },
    maxMarks: { type: Number, required: true },
    marksObtained: { type: Number, required: true, min: 0 }
}, { _id: false });

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
    pattern: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InternalPattern',
        required: true
    },
    academicYear: { type: String, required: true },
    semester: { type: String, required: true },
    department: { type: String, required: true },

    componentMarks: [componentMarkSchema],
    totalObtained: { type: Number, default: 0 },   // auto-calculated on save
    totalMax: { type: Number, default: 0 },

    isDraft: { type: Boolean, default: true },          // draft until submitted to HOD
    submittedToHOD: { type: Boolean, default: false },

    enteredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Pre-save: auto-calculate totalObtained and totalMax
internalMarkSchema.pre('save', function () {
    if (this.componentMarks && this.componentMarks.length > 0) {
        this.totalObtained = this.componentMarks.reduce((sum, c) => sum + (c.marksObtained || 0), 0);
        this.totalMax = this.componentMarks.reduce((sum, c) => sum + (c.maxMarks || 0), 0);
    }
});

// One mark record per student per subject per academic year/semester
internalMarkSchema.index({ student: 1, subject: 1, academicYear: 1, semester: 1 }, { unique: true });

module.exports = mongoose.model('InternalMark', internalMarkSchema);
