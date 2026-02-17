const express = require('express');
const router = express.Router();
const {
    submitAssignment,
    getMySubmissions,
    getSubmissionsForAssignment,
    gradeSubmission,
    getStudentStats
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

const upload = multer({ storage: storage });

router.route('/')
    .post(protect, authorize('student'), upload.single('file'), submitAssignment);

router.get('/my', protect, authorize('student'), getMySubmissions);

router.get('/stats/student', protect, authorize('student'), getStudentStats);

router.get('/assignment/:id', protect, authorize('staff'), getSubmissionsForAssignment);

router.put('/:id/grade', protect, authorize('staff'), gradeSubmission);

module.exports = router;
