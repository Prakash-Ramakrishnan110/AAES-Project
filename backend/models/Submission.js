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
    }
});

// Prevent multiple submissions for same assignment by same student (optional, but good for now)
submissionSchema.index({ student: 1, assignment: 1 }, { unique: true });

module.exports = mongoose.model('Submission', submissionSchema);
