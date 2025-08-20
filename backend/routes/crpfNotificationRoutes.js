const express = require('express');
const router = express.Router();
const crpfNotificationController = require('../controllers/crpfNotificationController');
const { authorize } = require('../middleware/authMiddleware');

router.use(authorize);


// Get all CRPF notifications (admin only)
router.get('/', (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }
    next();
}, crpfNotificationController.getCrpfNotifications);

// Get pending CRPF notifications (admin only)
router.get('/pending', (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }
    next();
}, crpfNotificationController.getPendingCrpfNotifications);

// Get CRPF notification by ID (admin only)
router.get('/:id', (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }
    next();
}, crpfNotificationController.getCrpfNotificationById);

// Update CRPF notification status (admin only)
router.put('/:id/status', (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }
    next();
}, crpfNotificationController.updateCrpfNotificationStatus);

// Create manual CRPF notification (admin only)
router.post('/manual', (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }
    next();
}, crpfNotificationController.createManualCrpfNotification);

module.exports = router;