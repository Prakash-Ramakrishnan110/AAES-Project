const express = require('express');
const router = express.Router();
const {
    createAssignment,
    getAssignments,
    getMyCreatedAssignments,
    getAssignmentById,
    deleteAssignment,
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
    .delete(protect, authorize('staff'), deleteAssignment);

module.exports = router;
