const express = require('express');
const router = express.Router();
const {
    getMyProfile,
    updateMyProfile,
    getUserProfile,
    getDepartmentStaff,
    getDepartmentStudents
} = require('../controllers/profileController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { profileUpload } = require('../middleware/uploadMiddleware');

router.use(protect); // All routes require login

// Personal Profile
router.route('/me')
    .get(getMyProfile)
    .put(profileUpload, updateMyProfile);

// HOD/Admin Directory Routes
router.get('/dept/staff', authorize('admin', 'hod'), getDepartmentStaff);
router.get('/dept/students', authorize('admin', 'hod'), getDepartmentStudents);

// Specific User Profile (Admin/HOD/Staff/Principal)
router.get('/user/:id', authorize('admin', 'hod', 'staff'), getUserProfile);

module.exports = router;
