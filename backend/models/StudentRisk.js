const mongoose = require('mongoose');

const studentRiskSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    semester: { type: String, required: true },
    academicYear: { type: String, required: true },
    department: { type: String },

    // Three risk pillars
    internalPercent: { type: Number, default: 100 },
    attendancePercent: { type: Number, default: 100 },
    assignmentPercent: { type: Number, default: 100 },

    // Computed risk
    riskLevel: {
        type: String,
        enum: ['Green', 'Yellow', 'Red'],
        default: 'Green'
    },

    // Escalation tracking
    consecutiveRedCount: { type: Number, default: 0 },
    escalationTriggered: { type: Boolean, default: false },
    lastCalculatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// One risk record per student per semester per year
studentRiskSchema.index({ student: 1, semester: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model('StudentRisk', studentRiskSchema);
