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
const { upload } = require('../middleware/uploadMiddleware');

router.use(protect); // All routes require login

// Personal Profile
router.route('/me')
    .get(getMyProfile)
    .put(upload.single('profileImage'), updateMyProfile);

// HOD Directory Routes
router.get('/dept/staff', authorize('hod', 'admin'), getDepartmentStaff);
router.get('/dept/students', authorize('hod', 'admin'), getDepartmentStudents);

// Specific User Profile (Admin/HOD/Staff/Principal)
router.get('/user/:id', authorize('hod', 'admin', 'staff', 'principal'), getUserProfile);

module.exports = router;
