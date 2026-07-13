const mongoose = require('mongoose');

const studyMaterialSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    subjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    extractedText: {
        type: String
    },
    visible: {
        type: Boolean,
        default: true
    },
    department: {
        type: String,
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
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('StudyMaterial', studyMaterialSchema);
