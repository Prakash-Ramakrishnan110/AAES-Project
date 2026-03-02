const mongoose = require('mongoose');

const componentSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true }, // e.g. "CIA 1", "Model Exam"
    maxMarks: { type: Number, required: true, min: 1 }
}, { _id: false });

const internalPatternSchema = new mongoose.Schema({
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    department: { type: String, required: true },
    academicYear: { type: String, required: true },
    semester: { type: String, required: true },
    version: { type: Number, default: 1 },

    components: { type: [componentSchema], required: true },
    totalInternalMax: { type: Number, required: true },

    // Workflow flags
    patternLocked: { type: Boolean, default: false },  // HOD locks structure
    marksLocked: { type: Boolean, default: false },    // HOD locks mark entry
    published: { type: Boolean, default: false },      // Visible to students

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// One active pattern per subject per academic year/semester
internalPatternSchema.index({ subject: 1, academicYear: 1, semester: 1 }, { unique: true });

module.exports = mongoose.model('InternalPattern', internalPatternSchema);
