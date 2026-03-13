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
    bulkUpdateStudents,
    getAuditLogs,
    getStaffStudents
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

const { profileUpload } = require('../middleware/uploadMiddleware');

router.use(protect);

router.route('/')
    .get(authorize('admin', 'hod', 'staff'), getUsers)
    .post(authorize('admin', 'hod'), profileUpload, createUser);

router.get('/stats/system', protect, authorize('admin', 'hod'), getSystemStats);
router.get('/staff-students', authorize('staff'), getStaffStudents);
router.post('/bulk-update', authorize('admin', 'hod'), bulkUpdateStudents);
router.post('/promote', authorize('admin', 'hod'), promoteStudents);
router.get('/staff/:id', authorize('admin', 'hod', 'staff'), getStaffProfile);
router.get('/audit-logs', authorize('admin'), getAuditLogs);

router.route('/:id')
    .put(authorize('admin', 'hod'), profileUpload, updateUser)
    .delete(authorize('admin', 'hod'), deleteUser);

module.exports = router;
