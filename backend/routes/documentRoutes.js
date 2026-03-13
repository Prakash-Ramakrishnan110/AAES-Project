const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    uploadDocument,
    getMyDocuments,
    getDepartmentDocuments,
    verifyDocument,
    deleteDocument,
    downloadAllDocuments,
    bulkDownloadDocuments
} = require('../controllers/documentController');

const { documentUpload } = require('../middleware/uploadMiddleware');

router.use((req, res, next) => {
    console.log(`[DocumentRouter] ${req.method} ${req.url}`);
    next();
});

router.use(protect);

// --- HOD / Staff Routes ---
router.get('/test-ping', (req, res) => res.json({ message: 'Document router is alive' }));

router.route('/download-all/:studentId')
    .get(authorize('hod', 'admin', 'staff'), downloadAllDocuments);

router.route('/bulk-download')
    .post(authorize('hod', 'admin', 'staff'), bulkDownloadDocuments);

router.route('/department')
    .get(authorize('hod', 'admin', 'staff'), getDepartmentDocuments);

// --- Student Routes ---
router.route('/me')
    .post(authorize('student'), documentUpload, uploadDocument)
    .get(authorize('student'), getMyDocuments);

router.route('/:id')
    .put(authorize('hod', 'admin'), verifyDocument)
    .delete(authorize('hod', 'admin', 'staff'), deleteDocument);

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
