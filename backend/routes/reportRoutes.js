const express = require('express');
const router = express.Router();
const { downloadExcelReport, downloadPdfReport } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin', 'hod', 'staff'));

router.get('/download-excel', downloadExcelReport);
router.get('/download-pdf', downloadPdfReport);

module.exports = router;
