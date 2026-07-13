const express = require('express');
const router = express.Router();
const { processSubmissionAI, submitVerification } = require('../controllers/aiEvaluationController');
const { protect } = require('../middleware/authMiddleware');

router.post('/process/:submissionId', protect, processSubmissionAI);
router.post('/verify/:submissionId', protect, submitVerification);

module.exports = router;
