const mongoose = require('mongoose');

const infrastructureSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['Classroom', 'Laboratory', 'IT Hub', 'Auditorium', 'Library', 'Other'],
        required: true
    },
    location: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Functional', 'Maintenance', 'Under Repair', 'Out of Service'],
        default: 'Functional'
    },
    lastMaintained: {
        type: Date,
        default: Date.now
    },
    utilizationRate: {
        type: Number,
        default: 0 // Percentage
    },
    department: {
        type: String, // Optional: if assigned to specific dept
        default: 'General'
    }
}, { timestamps: true });

module.exports = mongoose.model('Infrastructure', infrastructureSchema);
