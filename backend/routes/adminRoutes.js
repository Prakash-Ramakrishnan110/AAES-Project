const express = require('express');
const router = express.Router();
const { transitionSemester } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin'));

router.post('/semester-transition', transitionSemester);

module.exports = router;
