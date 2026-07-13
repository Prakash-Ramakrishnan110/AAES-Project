const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    department: { type: String },
    semester: { type: String, required: true },
    section: { type: String, default: 'All' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { 
        type: String, 
        enum: ['handwritten', 'document', 'ppt', 'quiz', 'code', 'seminar', 'programming'],
        default: 'handwritten'
    },
    submissionType: { type: String, default: 'handwritten' }, // For backward compatibility
    questions: [{ 
        text: String,
        questionText: String, // Supporting both legacy and new frontend property names
        options: [String],
        correctAnswer: String,
        marks: Number,
        modelAnswer: String
    }],
    modelAnswers: { type: String },
    maxMarks: { type: Number, required: true },
    totalMarks: { type: Number }, // For backward compatibility
    deadline: { type: Date, required: true },
    formatConfig: { type: mongoose.Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Assignment', assignmentSchema);
