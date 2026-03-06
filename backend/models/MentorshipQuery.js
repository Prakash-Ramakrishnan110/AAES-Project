const mongoose = require('mongoose');

const mentorshipQuerySchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    department: { type: String, required: true },
    queryType: {
        type: String,
        enum: ['Academic', 'Personal', 'Attendance', 'Other'],
        required: true
    },
    message: { type: String, required: true },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    status: {
        type: String,
        enum: ['Open', 'Resolved'],
        default: 'Open'
    },
    reply: { type: String },
    resolvedAt: { type: Date },
    followUpDate: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

mentorshipQuerySchema.pre('save', function () {
    this.updatedAt = Date.now();
});

module.exports = mongoose.model('MentorshipQuery', mentorshipQuerySchema);
