const express = require('express');
const router = express.Router();
const { recordSummary, getHistory, getReport } = require('../controllers/morningAttendanceSummaryController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', authorize('lab-assistant'), recordSummary);
router.get('/history', authorize('lab-assistant'), getHistory);
router.get('/report', authorize('hod', 'admin', 'principal'), getReport);

module.exports = router;
