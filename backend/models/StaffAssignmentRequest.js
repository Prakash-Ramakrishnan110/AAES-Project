const mongoose = require('mongoose');

const staffAssignmentRequestSchema = mongoose.Schema({
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true,
    },
    staff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    requestingDepartment: {
        type: String,
        required: true,
    },
    staffPrimaryDepartment: {
        type: String,
        required: true,
    },
    academicYear: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING',
    }
}, {
    timestamps: true,
});

const StaffAssignmentRequest = mongoose.model('StaffAssignmentRequest', staffAssignmentRequestSchema);

module.exports = StaffAssignmentRequest;
