const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', announcementController.getAnnouncements);
router.post('/', protect, authorize('admin', 'hod'), announcementController.createAnnouncement);
router.delete('/:id', protect, authorize('admin', 'hod'), announcementController.deleteAnnouncement);

module.exports = router;
