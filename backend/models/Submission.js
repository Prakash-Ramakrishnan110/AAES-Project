const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment',
        required: true
    },
    // For Python assignments
    code: {
        type: String,
        default: ''
    },
    // For Theory assignments (could be text or file URL in future)
    fileUrl: {
        type: String,
        default: ''
    },
    answers: {
        type: String,
        default: ''
    },
    marks: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['submitted', 'graded', 'pending'],
        default: 'submitted'
    },
    feedback: {
        type: String,
        default: ''
    },
    plagiarismScore: {
        type: Number,
        default: 0
    },
    isFlaggedForPlagiarism: {
        type: Boolean,
        default: false
    },
    flaggedSource: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Submission',
        default: null
    },
    // Detailed AI analysis
    aiAnalysis: {
        rawOutput: String, // Full response from AI
        metrics: {
            clarity: Number,
            relevance: Number,
            completeness: Number
        }
    },
    // Test case results for Python
    testCaseResults: [{
        input: String,
        expectedOutput: String,
        actualOutput: String,
        passed: Boolean
    }],
    submittedAt: {
        type: Date,
        default: Date.now
    },
    resubmissionStatus: {
        type: String,
        enum: ['none', 'requested', 'approved', 'rejected'],
        default: 'none'
    },
    resubmissionReason: {
        type: String,
        default: ''
    },
    // Mark Lock System
    marksLocked: {
        type: Boolean,
        default: false
    },
    lockedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    lockedAt: {
        type: Date,
        default: null
    },
    // AI Confidence
    needsManualReview: {
        type: Boolean,
        default: false
    },
    confidenceScores: [Number]
});

// Prevent multiple submissions for same assignment by same student (optional, but good for now)
submissionSchema.index({ student: 1, assignment: 1 }, { unique: true });

module.exports = mongoose.model('Submission', submissionSchema);
