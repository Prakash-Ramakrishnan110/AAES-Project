const Settings = require('../models/Settings');
const mongoose = require('mongoose');
const AuditLog = require('../models/AuditLog');

// @desc    Get global settings
// @route   GET /api/settings
// @access  Private/Admin
const getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne({ isInitialized: true });
        if (!settings) {
            settings = await Settings.create({ isInitialized: true });
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update global settings
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = async (req, res) => {
    try {
        const { currentAcademicYear, currentSemester, aiEngineUrl } = req.body;
        let settings = await Settings.findOne({ isInitialized: true });
        if (!settings) {
            settings = new Settings({ isInitialized: true });
        }

        const updatedFields = {};
        if (currentAcademicYear) {
            settings.currentAcademicYear = currentAcademicYear;
            updatedFields.currentAcademicYear = currentAcademicYear;
        }
        if (currentSemester) {
            settings.currentSemester = currentSemester;
            updatedFields.currentSemester = currentSemester;
        }
        if (aiEngineUrl) {
            settings.aiEngineUrl = aiEngineUrl;
            updatedFields.aiEngineUrl = aiEngineUrl;
        }

        await settings.save();

        await AuditLog.create({
            action: 'UPDATE_GLOBAL_SETTINGS',
            performedBy: req.user._id,
            targetModel: 'Settings',
            details: { updatedFields }
        });

        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Backup full database to JSON
// @route   GET /api/settings/backup
// @access  Private/Admin
const backupDatabase = async (req, res) => {
    try {
        const collections = Object.keys(mongoose.models);
        const backupData = {};

        for (const modelName of collections) {
            const Model = mongoose.models[modelName];
            backupData[modelName] = await Model.find({});
        }

        await AuditLog.create({
            action: 'DB_BACKUP',
            performedBy: req.user._id,
            targetModel: 'Database',
            details: { collections: collections.length }
        });

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=database_backup.json');
        res.send(JSON.stringify(backupData));
    } catch (error) {
        res.status(500).json({ message: 'Backup failed: ' + error.message });
    }
};

// @desc    Restore full database from JSON
// @route   POST /api/settings/restore
// @access  Private/Admin
const restoreDatabase = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No backup file provided' });
        }

        const backupData = JSON.parse(req.file.buffer.toString());

        for (const modelName of Object.keys(backupData)) {
            if (mongoose.models[modelName]) {
                const Model = mongoose.models[modelName];
                await Model.deleteMany({}); // Warning: Replaces everything
                const dataToInsert = backupData[modelName];
                if (dataToInsert && dataToInsert.length > 0) {
                    await Model.insertMany(dataToInsert);
                }
            }
        }

        await AuditLog.create({
            action: 'DB_RESTORE',
            performedBy: req.user._id,
            targetModel: 'Database',
            details: { collectionsRestored: Object.keys(backupData).length }
        });

        res.json({ message: 'Database restored successfully' });
    } catch (error) {
        console.error("Restore Error:", error);
        res.status(500).json({ message: 'Restore failed: ' + error.message });
    }
};

// @desc    Update global institutional goals
// @route   PUT /api/settings/goals
// @access  Private/Admin/Principal
const updateInstitutionalGoals = async (req, res) => {
    try {
        const { goals } = req.body;
        let settings = await Settings.findOne({ isInitialized: true });
        if (!settings) {
            settings = new Settings({ isInitialized: true });
        }

        settings.institutionalGoals = goals;
        await settings.save();

        await AuditLog.create({
            action: 'UPDATE_INSTITUTIONAL_GOALS',
            performedBy: req.user._id,
            targetModel: 'Settings',
            details: { goalCount: goals.length }
        });

        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get global institutional goals
// @route   GET /api/settings/goals
// @access  Private/Admin/Principal
const getInstitutionalGoals = async (req, res) => {
    try {
        const settings = await Settings.findOne({ isInitialized: true });
        res.json(settings ? settings.institutionalGoals : []);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getSettings,
    updateSettings,
    backupDatabase,
    restoreDatabase,
    updateInstitutionalGoals,
    getInstitutionalGoals
};
