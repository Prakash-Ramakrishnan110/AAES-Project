const mongoose = require('mongoose');

const studyMaterialSchema = new mongoose.Schema({
    subjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    unit: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['Lecture Notes', 'Important Questions', 'PYQ', 'Model Paper'],
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
    fileUrl: {
        type: String,
        required: true
    },
    extractedText: {
        type: String,
        default: ''
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    visible: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('StudyMaterial', studyMaterialSchema);
