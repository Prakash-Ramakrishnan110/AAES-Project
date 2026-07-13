const express = require('express');
const router = express.Router();
const { 
    getDepartmentPerformance,
    getSemesterTrends,
    getSubjectPerformance,
    getHODStats,
    getStaffWorkload,
    getAssignmentPerformanceComparison,
    getStaffPerformance
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin', 'hod'));

router.get('/hod/stats', getHODStats);
router.get('/hod/workload', getStaffWorkload);
router.get('/hod/comparison', getAssignmentPerformanceComparison);
router.get('/staff/performance', getStaffPerformance);
router.get('/department', getDepartmentPerformance);
router.get('/semester', getSemesterTrends);
router.get('/subject', getSubjectPerformance);

module.exports = router;
