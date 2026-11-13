const express = require('express');
const { createReport, getReports, reviewReport } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, createReport);                        // any logged-in user
router.get('/', protect, authorize('admin'), getReports);       // admins only
router.patch('/:id', protect, authorize('admin'), reviewReport); // admins only

module.exports = router;