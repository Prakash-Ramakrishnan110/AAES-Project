const express = require('express');
const router = express.Router();
const { createRequest, getRequests, updateRequest } = require('../controllers/reEvaluationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, authorize('student'), createRequest)
    .get(protect, getRequests);

router.route('/:id')
    .put(protect, authorize('staff', 'hod'), updateRequest);

module.exports = router;
