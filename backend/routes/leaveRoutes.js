const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    applyForLeave,
    getMyLeaves,
    getLeavesForAdvisor,
    getDepartmentLeaves,
    getInstitutionalLeaves,
    getLeaveStats,
    updateLeaveStatus
} = require('../controllers/leaveController');

router.use(protect);

// --- Student Routes ---
router.route('/me')
    .get(authorize('student'), getMyLeaves)
    .post(authorize('student'), applyForLeave);

// --- Class Advisor Routes (Staff) ---
router.route('/advisor')
    .get(authorize('staff'), getLeavesForAdvisor);

router.route('/:id/status')
    .put(authorize('staff'), updateLeaveStatus);

// --- HOD Routes ---
router.route('/department')
    .get(authorize('hod', 'admin'), getDepartmentLeaves);

// --- Principal/Admin Institutional Routes ---
router.get('/institutional', authorize('principal', 'admin'), getInstitutionalLeaves);
router.get('/stats', authorize('principal', 'admin'), getLeaveStats);

module.exports = router;
