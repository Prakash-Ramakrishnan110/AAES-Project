const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const internalController = require('../controllers/internalController');

// GET pattern by subjectId (HOD page load) — MUST be before /:patternId routes
router.get('/pattern/subject/:subjectId', protect, authorize('hod', 'staff'), internalController.getPatternBySubject);

// Pattern Routes (HOD)
router.post('/pattern', protect, authorize('hod'), internalController.upsertPattern);
router.put('/pattern/:patternId/lock', protect, authorize('hod'), internalController.lockPattern);
router.put('/pattern/:patternId/toggle-lock', protect, authorize('hod'), internalController.toggleMarksLock);
router.put('/pattern/:patternId/toggle-publish', protect, authorize('hod'), internalController.togglePublish);

// Marks Entry (Staff)
router.post('/marks', protect, authorize('staff'), internalController.saveMarks);

// Queries
router.get('/subject-marks', protect, authorize('staff', 'hod'), internalController.getSubjectMarks);
router.get('/student-marks', protect, authorize('student'), internalController.getStudentMarks);

module.exports = router;
