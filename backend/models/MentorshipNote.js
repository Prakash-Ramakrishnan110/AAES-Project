const mongoose = require('mongoose');

const mentorshipNoteSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    advisor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    noteType: {
        type: String,
        required: true,
        enum: ['General', 'Counseling Done', 'Parent Contacted']
    },
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('MentorshipNote', mentorshipNoteSchema);
