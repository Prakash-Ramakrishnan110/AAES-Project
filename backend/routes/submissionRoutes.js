const express = require('express');
const router = express.Router();
const {
    submitAssignment,
    getMySubmissions,
    getSubmissionsForAssignment,
    gradeSubmission,
    getStudentStats,
    requestResubmit,
    handleResubmissionStatus
} = require('../controllers/submissionController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { createDynamicUpload } = require('../middleware/uploadMiddleware');

const uploadMiddleware = createDynamicUpload('submissions');

router.route('/')
    .post(protect, authorize('student'), uploadMiddleware, submitAssignment);

router.get('/my', protect, authorize('student'), getMySubmissions);
router.get('/stats', protect, authorize('student'), getStudentStats);
router.get('/assignment/:id', protect, authorize('staff', 'hod'), getSubmissionsForAssignment);
router.put('/:id/grade', protect, authorize('staff'), gradeSubmission);
router.post('/:id/request-resubmit', protect, authorize('student'), requestResubmit);
router.put('/:id/resubmit-status', protect, authorize('staff'), handleResubmissionStatus);

module.exports = router;

