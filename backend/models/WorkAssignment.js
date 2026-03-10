const mongoose = require('mongoose');

const workAssignmentSchema = new mongoose.Schema({
    taskId: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    assignedStaffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // HOD
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Medium'
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Completed'],
        default: 'Pending'
    }
}, { timestamps: true });

// Auto-generate taskId before saving if not present
workAssignmentSchema.pre('validate', async function () {
    if (!this.taskId) {
        // Generate a unique task ID based on current document count
        const Count = await mongoose.model('WorkAssignment').countDocuments();
        this.taskId = `TASK-${String(Count + 1).padStart(4, '0')}`;
    }
});

module.exports = mongoose.model('WorkAssignment', workAssignmentSchema);
