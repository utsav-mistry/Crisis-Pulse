const express = require('express');
const router = express.Router();
const crpfNotificationController = require('../controllers/crpfNotificationController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');


// Get all CRPF notifications (admin & crpf only)
router.get('/', authMiddleware, authorize('admin', 'crpf'), crpfNotificationController.getCrpfNotifications);

// Get pending CRPF notifications (admin & crpf only)
router.get('/pending', authMiddleware, authorize('admin', 'crpf'), crpfNotificationController.getPendingCrpfNotifications);

// Get CRPF notification by ID (admin & crpf only)
router.get('/:id', authMiddleware, authorize('admin', 'crpf'), crpfNotificationController.getCrpfNotificationById);

// Update CRPF notification status (admin & crpf only)
router.put('/:id/status', authMiddleware, authorize('admin', 'crpf'), crpfNotificationController.updateCrpfNotificationStatus);

// Create manual CRPF notification (admin & crpf only)
router.post('/manual', authMiddleware, authorize('admin', 'crpf'), crpfNotificationController.createManualCrpfNotification);

module.exports = router;