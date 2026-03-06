const express = require('express');
const router = express.Router();
const {
    assignClassAdvisor,
    getAssignments,
    getMyClass,
    getAdvisedStudents,
    addMentorshipNote,
    getMentorshipNotes,
    getAllClassNotes,
    getMyClassStats,
    getAdvisorAcademicInsights,
    getConsolidatedReportData,
    getStudentTimeline
} = require('../controllers/advisorController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

// HOD / Admin Routes
router.post('/assign', authorize('admin', 'hod'), assignClassAdvisor);
router.get('/assignments', authorize('admin', 'hod'), getAssignments);

// Staff (Advisor) Routes
router.get('/my-class', authorize('staff'), getMyClass);
router.get('/my-class-stats', authorize('staff'), getMyClassStats);
router.get('/academic-insights', authorize('staff'), getAdvisorAcademicInsights);
router.get('/consolidated-report-data', authorize('admin', 'hod', 'staff'), getConsolidatedReportData);
router.get('/all-notes', authorize('staff'), getAllClassNotes);
router.get('/students', authorize('staff'), getAdvisedStudents);
router.post('/student/:id/notes', authorize('staff'), addMentorshipNote);

// Shared / Mixed Access Routes
router.get('/student/:id/notes', authorize('admin', 'hod', 'staff'), getMentorshipNotes);
router.get('/student/:id/timeline', authorize('admin', 'hod', 'staff'), getStudentTimeline);

module.exports = router;
