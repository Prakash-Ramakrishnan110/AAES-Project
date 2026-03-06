const express = require('express');
const router = express.Router();
const {
    submitAssignment,
    getMySubmissions,
    getSubmissionsForAssignment,
    gradeSubmission,
    lockMarks,
    unlockMarks,
    getStudentStats,
    requestResubmission,
    updateResubmissionStatus,
    runSampleTests
} = require('../controllers/submissionController');
const { protect, authorize } = require('../middleware/authMiddleware');

const multer = require('multer');
const path = require('path');

// Configure Multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Ensure this directory exists
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// File type whitelist
const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
];

const fileFilter = (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF, DOCX, JPG, PNG, and PPT files are allowed.'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.route('/')
    .post(protect, authorize('student'), upload.single('file'), submitAssignment);

router.get('/my', protect, authorize('student'), getMySubmissions);

router.get('/stats/student', protect, authorize('student'), getStudentStats);

router.post('/run-samples', protect, authorize('student'), runSampleTests);

router.get('/assignment/:id', protect, authorize('staff'), getSubmissionsForAssignment);

router.put('/:id/grade', protect, authorize('staff'), gradeSubmission);

router.post('/:id/request-resubmit', protect, authorize('student'), requestResubmission);
router.put('/:id/resubmit-status', protect, authorize('staff'), updateResubmissionStatus);

// Mark Lock routes
router.put('/:id/lock', protect, authorize('staff'), lockMarks);
router.put('/:id/unlock', protect, authorize('hod'), unlockMarks);

module.exports = router;
