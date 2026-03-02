const express = require('express');
const router = express.Router();
const { getQueries, createQuery, replyQuery, assignMentors, getMyMentees, getStaffForMentorAssignment } = require('../controllers/mentorshipController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/assign')
    .post(authorize('staff', 'hod', 'admin'), assignMentors);

router.route('/my-mentees')
    .get(authorize('staff'), getMyMentees);

router.route('/staff')
    .get(authorize('staff', 'hod', 'admin'), getStaffForMentorAssignment);

router.route('/')
    .get(getQueries)
    .post(authorize('student'), createQuery);

router.route('/:id')
    .put(authorize('staff'), replyQuery);

module.exports = router;
