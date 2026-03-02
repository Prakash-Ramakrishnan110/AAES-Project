const express = require('express');
const router = express.Router();
const {
    createAssignment,
    updateAssignment,
    getAssignments,
    getMyCreatedAssignments,
    getAssignmentById,
    deleteAssignment,
    getAssignmentGradebook,
    getStaffStats,
    getStudentAssignments
} = require('../controllers/assignmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, authorize('staff'), createAssignment)
    .get(protect, getAssignments);

router.get('/my-created', protect, authorize('staff'), getMyCreatedAssignments);
router.get('/student', protect, authorize('student'), getStudentAssignments);
router.get('/stats/staff', protect, authorize('staff'), getStaffStats);

router.route('/:id')
    .get(protect, getAssignmentById)
    .put(protect, authorize('staff'), updateAssignment)
    .delete(protect, authorize('staff'), deleteAssignment);

router.get('/:id/gradebook', protect, authorize('staff'), getAssignmentGradebook);

module.exports = router;
