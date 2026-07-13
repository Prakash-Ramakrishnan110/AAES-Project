const mongoose = require('mongoose');

const StudentRiskSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    riskLevel: { type: String, enum: ['Red', 'Yellow', 'Green'], default: 'Green' },
    semester: { type: String },
    academicYear: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('StudentRisk', StudentRiskSchema);
