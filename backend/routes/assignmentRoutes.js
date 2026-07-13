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
const { protect, authorize, protectPastSemesters } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, authorize('staff'), protectPastSemesters, createAssignment)
    .get(protect, getAssignments);

router.get('/my-created', protect, authorize('staff'), getMyCreatedAssignments);
router.get('/student', protect, authorize('student'), getStudentAssignments);
router.get('/stats/staff', protect, authorize('staff'), getStaffStats);

router.route('/:id')
    .get(protect, getAssignmentById)
    .put(protect, authorize('staff'), protectPastSemesters, updateAssignment)
    .delete(protect, authorize('staff'), protectPastSemesters, deleteAssignment);

router.get('/:id/gradebook', protect, authorize('staff', 'hod'), getAssignmentGradebook);

module.exports = router;
