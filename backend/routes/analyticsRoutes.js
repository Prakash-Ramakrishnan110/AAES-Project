const express = require('express');
const router = express.Router();
const {
    getDepartmentPerformance,
    getSemesterTrends,
    getHODStats,
    getSubjectPerformance,
    getStaffPerformance,
    getStudentPerformance,
    getStaffWorkload,
    getAssignmentPerformanceComparison,
    getMentorshipOversight,
    getCCMOversight,
    getFacultyPerformanceMatrix,
    getAcademicForecast
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/department', protect, authorize('admin'), getDepartmentPerformance);
router.get('/semester', protect, authorize('admin', 'hod'), getSemesterTrends);
router.get('/subject', protect, authorize('admin', 'staff', 'hod'), getSubjectPerformance);
router.get('/hod/stats', protect, authorize('hod'), getHODStats);
router.get('/hod/workload', protect, authorize('hod'), getStaffWorkload);
router.get('/hod/comparison', protect, authorize('hod'), getAssignmentPerformanceComparison);
router.get('/hod/mentorship-oversight', protect, authorize('hod'), getMentorshipOversight);
router.get('/hod/ccm-oversight', protect, authorize('hod'), getCCMOversight);
router.get('/staff/performance', protect, authorize('admin', 'hod'), getStaffPerformance);
router.get('/student/performance', protect, authorize('admin', 'hod'), getStudentPerformance);

// Principal specific analytics
router.get('/principal/faculty-matrix', protect, authorize('principal', 'admin'), getFacultyPerformanceMatrix);
router.get('/principal/forecast', protect, authorize('principal', 'admin'), getAcademicForecast);

module.exports = router;
