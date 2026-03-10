const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    createTimetableEntry,
    getDepartmentTimetable,
    getMyTimetable,
    createActivityLog,
    getLogReminders,
    getStaffActivityLogs,
    deleteActivityLog,
    deleteTimetableEntry
} = require('../controllers/timetableController');

router.use(protect);

// --- General Routes ---
router.route('/department/:semester')
    .get(authorize('hod', 'admin', 'staff', 'class advisor'), getDepartmentTimetable);

router.route('/')
    .post(authorize('hod', 'admin'), createTimetableEntry);

router.route('/:id')
    .delete(authorize('hod', 'admin'), deleteTimetableEntry);

// --- Staff Routes ---
router.route('/staff/me')
    .get(authorize('staff', 'class advisor', 'hod'), getMyTimetable);

router.route('/activity-log')
    .post(authorize('staff', 'class advisor', 'hod'), createActivityLog);

router.route('/activity-log/reminders')
    .get(authorize('staff', 'class advisor', 'hod'), getLogReminders);

router.route('/activity-log/history')
    .get(authorize('staff', 'class advisor', 'hod', 'principal'), getStaffActivityLogs);

router.route('/activity-log/:id')
    .delete(authorize('staff', 'class advisor', 'hod'), deleteActivityLog);

module.exports = router;
