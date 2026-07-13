const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { 
    getSettings, 
    updateSettings, 
    backupDatabase, 
    restoreDatabase 
} = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('hod'));

router.get('/', protect, authorize('admin', 'hod'), getSettings);
router.put('/', protect, authorize('admin', 'hod'), updateSettings);
router.get('/backup', backupDatabase);
router.post('/restore', upload.single('backupFile'), restoreDatabase);

module.exports = router;
