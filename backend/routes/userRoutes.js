const express = require('express');
const router = express.Router();
const {
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    getSystemStats,
    promoteStudents
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin')); // All routes restricted to Admin

router.route('/')
    .get(getUsers)
    .post(createUser);

router.get('/stats/system', protect, authorize('admin', 'hod'), getSystemStats);
router.post('/promote', promoteStudents);

router.route('/:id')
    .put(updateUser)
    .delete(deleteUser);

module.exports = router;
