const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// @desc    Get system settings
// @route   GET /api/settings
// @access  Private/Admin
exports.getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({});
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update system settings
// @route   PUT /api/settings
// @access  Private/Admin
exports.updateSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings(req.body);
        } else {
            Object.assign(settings, req.body);
        }
        
        settings.updatedBy = req.user.id;
        await settings.save();
        
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Backup Database
// @route   GET /api/settings/backup
// @access  Private/Admin
exports.backupDatabase = async (req, res) => {
    try {
        const collections = await mongoose.connection.db.listCollections().toArray();
        const backup = {};
        
        for (const col of collections) {
            const data = await mongoose.connection.db.collection(col.name).find().toArray();
            backup[col.name] = data;
        }
        
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=backup_${Date.now()}.json`);
        res.send(JSON.stringify(backup, null, 2));
    } catch (error) {
        res.status(500).json({ message: 'Backup failed: ' + error.message });
    }
};

// @desc    Restore Database
// @route   POST /api/settings/restore
// @access  Private/Admin
exports.restoreDatabase = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a backup file' });
        }

        const backupData = JSON.parse(fs.readFileSync(req.file.path, 'utf8'));
        
        // Caution: This wipes current data
        for (const colName in backupData) {
            await mongoose.connection.db.collection(colName).deleteMany({});
            if (backupData[colName].length > 0) {
                // Remove _id from objects to avoid duplication or keep them? 
                // Restore usually keeps them.
                await mongoose.connection.db.collection(colName).insertMany(backupData[colName]);
            }
        }
        
        // Clean up uploaded file
        fs.unlinkSync(req.file.path);
        
        res.json({ message: 'Restored successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Restore failed: ' + error.message });
    }
};
