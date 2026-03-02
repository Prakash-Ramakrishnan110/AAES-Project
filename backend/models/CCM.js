const mongoose = require('mongoose');

const ccmActionItemSchema = new mongoose.Schema({
    description: { type: String, required: true },
    responsiblePerson: { type: String, required: true },
    deadline: { type: Date, required: true },
    status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' }
});

const ccmSchema = new mongoose.Schema({
    department: { type: String, required: true },
    academicYear: { type: String, required: true },
    meetingDate: { type: Date, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Advisor
    category: { type: String, enum: ['Academic', 'Infrastructure', 'Faculty', 'Exam'], default: 'Academic' },
    agenda: { type: String, required: true },
    notes: { type: String },
    decisions: { type: String },
    studentReps: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    studentRepsPresent: { type: Number, default: 0 },
    absentCount: { type: Number, default: 0 },
    actionItems: [ccmActionItemSchema],
    minutesPDF: { type: String }, // Path to uploaded file
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CCM', ccmSchema);
