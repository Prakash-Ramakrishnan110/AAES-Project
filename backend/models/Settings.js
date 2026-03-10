const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    // Singleton pattern - we'll only ever have one document
    isInitialized: {
        type: Boolean,
        default: true,
        unique: true
    },
    currentAcademicYear: {
        type: String,
        default: '2024-2025'
    },
    currentSemester: {
        type: String,
        enum: ['Odd', 'Even'],
        default: 'Odd'
    },
    aiEngineUrl: {
        type: String,
        default: 'http://localhost:8000'
    },
    institutionalGoals: [{
        key: String,
        target: Number,
        current: { type: Number, default: 0 },
        unit: String,
        deadline: Date
    }]
}, { timestamps: true });

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;
