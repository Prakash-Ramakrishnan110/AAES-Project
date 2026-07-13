const mongoose = require('mongoose');

const MentorshipQuerySchema = new mongoose.Schema({
    department: { type: String },
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['Open', 'Resolved', 'Closed'], default: 'Open' },
    resolvedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('MentorshipQuery', MentorshipQuerySchema);
