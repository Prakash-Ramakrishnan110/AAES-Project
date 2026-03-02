const express = require('express');
const router = express.Router();
const {
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    getSystemStats,
    promoteStudents,
    getStaffProfile,
    bulkUpdateStudents
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.route('/')
    .get(authorize('admin', 'hod', 'staff'), getUsers)
    .post(authorize('admin', 'hod'), upload.single('profileImage'), createUser);

router.get('/stats/system', protect, authorize('admin', 'hod'), getSystemStats);
router.post('/bulk-update', authorize('admin', 'hod'), bulkUpdateStudents);
router.post('/promote', authorize('admin', 'hod'), promoteStudents);
router.get('/staff/:id', authorize('admin', 'hod', 'staff'), getStaffProfile);

router.route('/:id')
    .put(authorize('admin', 'hod'), upload.single('profileImage'), updateUser)
    .delete(authorize('admin', 'hod'), deleteUser);

module.exports = router;
