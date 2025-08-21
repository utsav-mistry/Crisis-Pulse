const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const getLLMAdvice = require('../utils/getLLMAdvice');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

// AI advice endpoint
// User-specific notification routes
router.get('/me', authMiddleware, notificationController.getUserNotifications);
router.put('/read-all', authMiddleware, notificationController.markAllNotificationsAsRead);
router.put('/:id/read', authMiddleware, notificationController.markNotificationAsRead);

// AI advice endpoint
router.post('/ai-advice', authMiddleware, async (req, res) => {
    try {
        const { type, location, severity } = req.body;
        const advice = await getLLMAdvice(type, location?.city, severity);
        res.json({ advice });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Admin routes for managing all notifications
router.post('/', authMiddleware, authorize('admin'), notificationController.createNotification);
router.get('/', authMiddleware, authorize('admin'), notificationController.getNotifications);
router.get('/:id', authMiddleware, authorize('admin'), notificationController.getNotificationById);
router.put('/:id', authMiddleware, authorize('admin'), notificationController.updateNotification);
router.delete('/:id', authMiddleware, authorize('admin'), notificationController.deleteNotification);

// Public endpoints (no auth required)
router.get('/public/latest', notificationController.getLatestPublicNotifications);
router.post('/broadcast', authMiddleware, authorize('admin'), notificationController.broadcastNotification);

module.exports = router;
