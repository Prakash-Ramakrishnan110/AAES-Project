const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    assignWork,
    getDepartmentWork,
    getMyWork,
    updateTaskStatus
} = require('../controllers/workAssignmentController');

router.use(protect);

// --- HOD / Admin Routes ---
router.route('/')
    .post(authorize('hod', 'admin'), assignWork);

router.route('/department')
    .get(authorize('hod', 'admin'), getDepartmentWork);

// --- Staff / Class Advisor Routes ---
router.route('/me')
    .get(authorize('staff'), getMyWork);

router.route('/:id/status')
    .put(authorize('staff'), updateTaskStatus);

module.exports = router;
