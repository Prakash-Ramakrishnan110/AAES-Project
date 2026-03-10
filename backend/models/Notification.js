const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['Info', 'Success', 'Warning', 'Alert', 'Grading', 'Escalation'],
        default: 'Info'
    },
    read: {
        type: Boolean,
        default: false
    },
    link: {
        type: String // Optional link to redirect user
    },
    priority: {
        type: String,
        enum: ['Normal', 'High', 'Emergency'],
        default: 'Normal'
    }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
