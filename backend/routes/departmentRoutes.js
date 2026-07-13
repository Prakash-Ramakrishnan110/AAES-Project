const express = require('express');
const router = express.Router();
const {
    createDepartment,
    getDepartments,
    updateDepartment,
    deleteDepartment
} = require('../controllers/departmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getDepartments)
    .post(protect, authorize('admin', 'hod'), createDepartment)

router.route('/:id')
    .put(protect, authorize('admin', 'hod'), updateDepartment)
    .delete(protect, authorize('admin', 'hod'), deleteDepartment);

module.exports = router;
