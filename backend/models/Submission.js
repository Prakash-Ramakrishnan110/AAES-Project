const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
    fileUrl: { type: String },
    fileHash: { type: String },
    extractedText: { type: String },
    correctedText: { type: String },
    marks: { type: Number, default: 0 },
    feedback: { type: String },
    isVerified: { type: Boolean, default: false },
    similarityScore: { type: Number, default: 0 },
    confidenceScore: { type: Number, default: 0 },
    aiResultStatus: { 
        type: String, 
        enum: ['pending', 'graded', 'verified', 'flagged'], 
        default: 'pending' 
    },
    aiConfidence: { type: Number, default: 0 },
    reasoning: { type: String },
    conceptAnalysis: { type: Map, of: String },
    learningFeedback: { type: String },
    suggestedStudy: { type: String },
    consistencyStatus: { type: String },
    status: { 
        type: String, 
        enum: ['submitted', 'graded', 're-eval-pending', 're-eval-approved', 're-eval-rejected'], 
        default: 'submitted' 
    },
    resubmissionStatus: { 
        type: String, 
        enum: ['none', 'requested', 'approved', 'rejected'], 
        default: 'none' 
    },
    resubmissionReason: { type: String },
    submittedAt: { type: Date, default: Date.now }
});

submissionSchema.index({ studentId: 1, assignmentId: 1 }, { unique: true });

module.exports = mongoose.model('Submission', submissionSchema);
