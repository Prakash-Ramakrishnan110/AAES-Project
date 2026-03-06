const mongoose = require('mongoose');

const StudyResourceSchema = new mongoose.Schema({
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    title: { type: String, required: true },
    unit: { type: String, required: true },
    type: {
        type: String,
        required: true,
        enum: ['Lecture Notes', 'Important Questions', 'Previous Year Question Paper', 'Model Question Paper']
    },
    academicYear: { type: String, required: true },
    semester: { type: String, required: true },
    fileUrl: { type: String, required: true },
    extractedText: { type: String, default: '' },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    visible: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StudyResource', StudyResourceSchema);
