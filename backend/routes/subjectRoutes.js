const express = require('express');
const router = express.Router();
const {
    createSubject,
    getSubjects,
    assignStaff,
    deleteSubject
} = require('../controllers/subjectController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, authorize('admin', 'hod'), createSubject) // HODs might also create subjects
    .get(protect, getSubjects);

router.route('/:id/assign')
    .put(protect, authorize('admin', 'hod'), assignStaff);

router.route('/:id')
    .delete(protect, authorize('admin'), deleteSubject);

module.exports = router;
