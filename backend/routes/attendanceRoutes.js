const express = require('express');
const router = express.Router();
const {
    markAttendance,
    getSessionAttendance,
    getSubjectSummary,
    getAdvisorView,
    getHODView,
    getStudentsForSubject,
    getMyAttendance,
    getAttendanceAlerts,
    getAttendanceHeatmap
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

// Staff routes
router.post('/', authorize('staff'), markAttendance);
router.get('/session', authorize('staff', 'hod', 'admin'), getSessionAttendance);
router.get('/subject/:id/students', authorize('staff', 'hod', 'admin'), getStudentsForSubject);
router.get('/subject/:id/summary', authorize('staff', 'hod', 'admin'), getSubjectSummary);

// Advisor route (staff who are advisors)
router.get('/advisor', authorize('staff'), getAdvisorView);

// HOD route
router.get('/hod', authorize('hod', 'admin'), getHODView);

// Student route
router.get('/my', authorize('student'), getMyAttendance);

// Attendance Intelligence routes
router.get('/alerts', authorize('staff', 'hod', 'admin'), getAttendanceAlerts);
router.get('/heatmap', authorize('staff', 'hod', 'admin'), getAttendanceHeatmap);

module.exports = router;

