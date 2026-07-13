const express = require('express');
const router = express.Router();
const { getStudentMarks } = require('../controllers/internalController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/student-marks', protect, authorize('student'), getStudentMarks);

module.exports = router;
