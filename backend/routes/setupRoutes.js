const express = require('express');
const router = express.Router();
const setupController = require('../controllers/setupController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

// POST /api/setup/admin - Create first admin (one-time setup)
router.post('/admin', setupController.createFirstAdmin);

// GET /api/setup/status - Check admin creation status
router.get('/status', setupController.getAdminCreationStatus);

// POST /api/setup/reset - Reset admin creation lock (development only)
router.post('/reset', setupController.resetAdminCreationLock);

module.exports = router;
