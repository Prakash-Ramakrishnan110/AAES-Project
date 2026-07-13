const mongoose = require('mongoose');

const reEvaluationRequestSchema = new mongoose.Schema({
    submissionId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Submission', 
        required: true 
    },
    assignmentId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Assignment', 
        required: true 
    },
    subjectId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Subject', 
        required: true 
    },
    studentId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    originalScore: { 
        type: Number, 
        required: true 
    },
    reason: { 
        type: String, 
        required: true 
    },
    ocrCorrection: { 
        type: String 
    },
    status: { 
        type: String, 
        enum: ['pending', 'reviewed', 'completed', 'rejected'], 
        default: 'pending' 
    },
    reviewedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    remarks: { 
        type: String 
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ReEvaluationRequest', reEvaluationRequestSchema);
