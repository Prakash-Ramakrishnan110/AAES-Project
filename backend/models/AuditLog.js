const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    // Open string — no enum restriction so new actions can be added freely
    action: {
        type: String,
        required: true
    },
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    role: { type: String },  // role of the performer at time of action
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'targetModel'
    },
    targetModel: {
        type: String,
        description: 'The mongoose model of the target document'
    },
    department: { type: String },
    previousValue: { type: mongoose.Schema.Types.Mixed },
    newValue: { type: mongoose.Schema.Types.Mixed },
    details: { type: Object },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

auditLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);

