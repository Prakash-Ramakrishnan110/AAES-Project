const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    department: { type: String, required: true },
    semester: { type: String, required: true },
    academicYear: { type: String, required: true },
    staff: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // For backward compatibility
    isArchived: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Subject', subjectSchema);
