const mongoose = require('mongoose');

const studentDocumentSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    department: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['Personal', 'Financial'],
        default: 'Personal',
        required: true
    },
    documentType: {
        type: String, // 'Aadhaar', 'Tuition Fee', etc.
        required: true
    },
    semester: {
        type: Number
    },
    academicYear: {
        type: String // e.g., '2023-2024'
    },
    fileUrl: {
        type: String, // S3 or Local Upload Path
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Verified', 'Rejected'],
        default: 'Pending'
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    rejectionReason: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('StudentDocument', studentDocumentSchema);
