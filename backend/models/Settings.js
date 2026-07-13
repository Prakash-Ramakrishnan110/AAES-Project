const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    currentAcademicYear: {
        type: String,
        required: true,
        default: '2024-25'
    },
    currentSemester: {
        type: String,
        required: true,
        default: '1'
    },
    aiEngineUrl: {
        type: String,
        default: 'http://localhost:8000'
    },
    institutionName: {
        type: String,
        default: 'AAES CORE INSTITUTION'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema);
