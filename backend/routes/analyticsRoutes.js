const express = require('express');
const router = express.Router();
const {
    getDepartmentPerformance,
    getSemesterTrends,
    getHODStats
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/department', protect, authorize('admin'), getDepartmentPerformance);
router.get('/semester', protect, authorize('admin', 'hod'), getSemesterTrends);
router.get('/subject', protect, authorize('admin', 'staff', 'hod'), getSubjectPerformance);
router.get('/hod/stats', protect, authorize('hod'), getHODStats);

module.exports = router;
