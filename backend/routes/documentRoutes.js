const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    uploadDocument,
    getMyDocuments,
    getDepartmentDocuments,
    verifyDocument
} = require('../controllers/documentController');

const { documentUpload } = require('../middleware/uploadMiddleware');

router.use(protect);

// --- Student Routes ---
router.route('/me')
    .post(authorize('student'), documentUpload.single('file'), uploadDocument)
    .get(authorize('student'), getMyDocuments);

// --- HOD / Staff Routes ---
router.route('/department')
    .get(authorize('hod', 'admin', 'staff'), getDepartmentDocuments);

router.route('/:id/verify')
    .put(authorize('hod', 'admin'), verifyDocument);

router.get('/inspect-env', (req, res) => {
    res.json({
        user: req.user ? {
            _id: req.user._id,
            role: req.user.role,
            dept: req.user.department,
            email: req.user.email
        } : 'MISSING',
        env: process.env.NODE_ENV,
        db: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
});

module.exports = router;
