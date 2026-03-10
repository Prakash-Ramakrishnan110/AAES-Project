const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const governanceController = require('../controllers/governanceController');

// MENTOR ROUTES
router.get('/mentor/dashboard', protect, authorize('staff'), governanceController.getMentorDashboard);
router.post('/mentor/interaction', protect, authorize('staff'), governanceController.logInteraction);
router.get('/mentor/interaction/:studentId', protect, authorize('staff'), governanceController.getMenteeInteractions);

// CLASS ADVISOR ROUTES
// Note: Ideally authorized only if `req.user.isAdvisor` is true or if they are in ClassAdvisors table. Handled in controller logic.
router.get('/advisor/dashboard', protect, authorize('staff'), governanceController.getAdvisorDashboard);

// HOD ROUTES
router.get('/hod/dashboard', protect, authorize('hod'), governanceController.getHODGovernanceDashboard);
router.put('/hod/escalation/:escalationId', protect, authorize('hod'), governanceController.updateEscalation);

// PRINCIPAL ROUTES
router.get('/principal/dashboard', protect, authorize('principal'), governanceController.getPrincipalDashboard);
router.get('/principal/infrastructure', protect, authorize('principal'), governanceController.getPrincipalInfrastructure);
router.get('/principal/staff', protect, authorize('principal'), governanceController.getPrincipalStaff);
router.get('/principal/audit-logs', protect, authorize('principal'), governanceController.getPrincipalAuditLogs);
router.get('/principal/goals', protect, authorize('principal', 'admin'), governanceController.getInstitutionalGoals);

module.exports = router;

