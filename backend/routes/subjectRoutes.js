const express = require('express');
const router = express.Router();
const {
    createSubject,
    getSubjects,
    assignStaff,
    deleteSubject,
    getEligibleStaffForSubject,
    getPendingAssignmentRequests,
    approveAssignmentRequest,
    rejectAssignmentRequest
} = require('../controllers/subjectController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, authorize('admin', 'hod'), createSubject) // HODs allowed
    .get(protect, getSubjects);

router.route('/:id/assign')
    .put(protect, authorize('admin', 'hod'), assignStaff); // HODs allowed to assign staff

router.route('/:id/eligible-staff')
    .get(protect, authorize('admin', 'hod'), getEligibleStaffForSubject);

// Assignment Request Routes (Must be before /:id)
router.get('/assignment-requests/pending', protect, authorize('hod'), getPendingAssignmentRequests);
router.put('/assignment-requests/:id/approve', protect, authorize('hod'), approveAssignmentRequest);
router.put('/assignment-requests/:id/reject', protect, authorize('hod'), rejectAssignmentRequest);

router.route('/:id')
    .delete(protect, authorize('admin', 'hod'), deleteSubject); // HODs allowed to delete subjects (their own, handled in logic if needed, but strict governance usually allows HOD to manage their dept subjects)

module.exports = router;
