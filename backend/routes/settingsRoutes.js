const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getSettings, updateSettings, backupDatabase, restoreDatabase, updateInstitutionalGoals, getInstitutionalGoals } = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Use memory storage for the JSON backup file (avoids saving to disk since we parse it instantly)
const upload = multer({ storage: multer.memoryStorage() });

router.use(protect);
router.use(authorize('admin', 'principal')); // Only Admin/Principal

router.route('/')
    .get(getSettings)
    .put(updateSettings);

router.route('/goals')
    .get(getInstitutionalGoals)
    .put(updateInstitutionalGoals);

router.get('/backup', backupDatabase);
router.post('/restore', upload.single('backupFile'), restoreDatabase);

module.exports = router;
