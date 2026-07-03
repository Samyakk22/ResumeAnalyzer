const express = require('express');
const router = express.Router();
const { getReports, getReport, downloadReport, deleteReport } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getReports);
router.get('/:id', getReport);
// PDF download route removed — keep route present but handled in controller
router.get('/:id/download', downloadReport);
router.delete('/:id', deleteReport);

module.exports = router;
