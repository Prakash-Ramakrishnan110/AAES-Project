const express = require('express');
const router = express.Router();
const { getNotifications, markRead, markAllRead, sendAnnouncement, sendEmergencyBroadcast, getAllNotificationsForPrincipal } = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getNotifications);

router.route('/read-all')
    .put(protect, markAllRead);

router.route('/:id/read')
    .put(protect, markRead);

router.post('/send', protect, authorize('admin', 'hod', 'staff', 'principal'), sendAnnouncement);
router.post('/emergency', protect, authorize('admin', 'principal'), sendEmergencyBroadcast);
router.get('/principal/all', protect, authorize('principal', 'admin'), getAllNotificationsForPrincipal);

module.exports = router;
