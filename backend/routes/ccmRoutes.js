const express = require('express');
const router = express.Router();
const { getCCMs, createCCM, getCCMById, addActionItem, updateActionItem } = require('../controllers/ccmController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { createDynamicUpload } = require('../middleware/uploadMiddleware');

router.use(protect);

router.route('/')
    .get(authorize('hod', 'staff'), getCCMs)
    .post(authorize('staff'), createDynamicUpload('ccm', 'minutesPDF'), createCCM);

router.route('/:id')
    .get(authorize('hod', 'staff'), getCCMById);

router.route('/:id/actions')
    .post(authorize('staff'), addActionItem);

router.route('/:id/actions/:actionId')
    .put(authorize('staff'), updateActionItem);

module.exports = router;
