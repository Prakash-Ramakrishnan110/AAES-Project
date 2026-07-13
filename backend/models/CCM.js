const mongoose = require('mongoose');

const CCMSchema = new mongoose.Schema({
    department: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    actionItems: [{
        status: { type: String, enum: ['Pending', 'Completed', 'Overdue'] },
        targetDate: { type: Date },
        deadline: { type: Date }
    }]
}, { timestamps: true });

module.exports = mongoose.model('CCM', CCMSchema);
