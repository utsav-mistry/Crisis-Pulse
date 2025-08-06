const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const getLLMAdvice = require('../utils/getLLMAdvice');

// AI advice endpoint
router.post('/ai-advice', async (req, res) => {
    try {
        const { type, location, severity } = req.body;
        const advice = await getLLMAdvice(type, location?.city, severity);
        res.json({ advice });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/', notificationController.createNotification);
router.get('/', notificationController.getNotifications);
router.get('/:id', notificationController.getNotificationById);
router.put('/:id', notificationController.updateNotification);
router.delete('/:id', notificationController.deleteNotification);

// Public endpoints (no auth required)
router.get('/public/latest', notificationController.getLatestPublicNotifications);
router.post('/broadcast', notificationController.broadcastNotification);

module.exports = router;
