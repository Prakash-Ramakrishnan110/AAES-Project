const express = require('express');
const router = express.Router();
const {
    createSubject,
    getSubjects,
    updateSubject,
    assignStaff,
    deleteSubject,
    getEligibleStaffForSubject,
    getStaffWorkload,
    getMyEnrolledSubjects,
    getMyAssignedSubjects
} = require('../controllers/subjectController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/my-enrolled', protect, authorize('student'), getMyEnrolledSubjects);
router.get('/my-assigned', protect, authorize('staff', 'hod'), getMyAssignedSubjects);

router.route('/')
    .post(protect, authorize('admin', 'hod'), createSubject)
    .get(protect, getSubjects);

router.route('/:id/assign')
    .put(protect, authorize('admin', 'hod'), assignStaff);

router.route('/:id/eligible-staff')
    .get(protect, authorize('admin', 'hod'), getEligibleStaffForSubject);

router.get('/workload/stats', protect, authorize('hod'), getStaffWorkload);

router.route('/:id')
    .put(protect, authorize('admin', 'hod'), updateSubject)
    .delete(protect, authorize('admin', 'hod'), deleteSubject);

module.exports = router;
