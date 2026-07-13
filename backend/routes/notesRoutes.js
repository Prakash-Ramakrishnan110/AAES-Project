const express = require('express');
const router = express.Router();
const {
    uploadNote,
    getNotesForSubject,
    getMyNotes,
    deleteNote,
    askAi
} = require('../controllers/notesController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { createDynamicUpload } = require('../middleware/uploadMiddleware');

const uploadMiddleware = createDynamicUpload('notes');

router.post('/upload', protect, authorize('staff'), uploadMiddleware, uploadNote);
router.get('/my', protect, authorize('staff'), getMyNotes);
router.get('/subject/:subjectId', protect, getNotesForSubject);
router.delete('/:id', protect, authorize('staff'), deleteNote);
router.post('/ask', protect, authorize('student'), askAi);

module.exports = router;
