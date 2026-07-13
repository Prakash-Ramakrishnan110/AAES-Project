const mongoose = require('mongoose');

const MentorStudentMapSchema = new mongoose.Schema({
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('MentorStudentMap', MentorStudentMapSchema);
