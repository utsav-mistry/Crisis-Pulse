const express = require('express');
const router = express.Router();
const webpush = require('web-push');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/authMiddleware');

// Generate VAPID keys for web push (for development only)
const vapidKeys = webpush.generateVAPIDKeys();

// In production, use environment variables:
// const vapidKeys = {
//     publicKey: process.env.VAPID_PUBLIC_KEY,
//     privateKey: process.env.VAPID_PRIVATE_KEY
// };

webpush.setVapidDetails(
    'mailto:utsavamistry30@gmail.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

// Store push subscriptions (in production, use database)
const subscriptions = new Map();

// Get VAPID public key endpoint
router.get('/vapid-key', (req, res) => {
    res.json({ publicKey: vapidKeys.publicKey });
});

// Subscribe to push notifications
router.post('/subscribe', authMiddleware, async (req, res) => {
    try {
        const { subscription } = req.body;
        const userId = req.user.id;

        // Store subscription in memory (in production, save to database)
        subscriptions.set(userId, subscription);

        // Update user with push subscription
        await User.findByIdAndUpdate(userId, {
            pushSubscription: subscription,
            pushEnabled: true
        });

        console.log(`User ${userId} subscribed to push notifications`);
        res.status(200).json({ message: 'Subscription successful' });
    } catch (error) {
        console.error('Push subscription error:', error);
        res.status(500).json({ error: 'Failed to subscribe to push notifications' });
    }
});

// Unsubscribe from push notifications
router.post('/unsubscribe', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        subscriptions.delete(userId);

        await User.findByIdAndUpdate(userId, {
            pushSubscription: null,
            pushEnabled: false
        });

        res.status(200).json({ message: 'Unsubscribed successfully' });
    } catch (error) {
        console.error('Push unsubscribe error:', error);
        res.status(500).json({ error: 'Failed to unsubscribe' });
    }
});

// Broadcast push notification to all subscribed users
router.post('/broadcast', authMiddleware, async (req, res) => {
    try {
        // Only admins can broadcast
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { title, message, type, priority } = req.body;

        const payload = JSON.stringify({
            title: title || 'Crisis Pulse Alert',
            body: message,
            type: type || 'info',
            priority: priority || 'normal',
            timestamp: new Date().toISOString(),
            url: '/app/disaster-feed'
        });

        // Get all users with push subscriptions
        const users = await User.find({
            pushEnabled: true,
            pushSubscription: { $exists: true, $ne: null }
        });

        const pushPromises = [];
        let successCount = 0;
        let failureCount = 0;

        for (const user of users) {
            try {
                const pushPromise = webpush.sendNotification(user.pushSubscription, payload)
                    .then(() => {
                        successCount++;
                        console.log(`Push sent to user ${user._id}`);
                    })
                    .catch(error => {
                        failureCount++;
                        console.error(`Push failed for user ${user._id}:`, error.message);

                        // Remove invalid subscriptions
                        if (error.statusCode === 410 || error.statusCode === 404) {
                            User.findByIdAndUpdate(user._id, {
                                pushSubscription: null,
                                pushEnabled: false
                            }).catch(console.error);
                        }
                    });

                pushPromises.push(pushPromise);
            } catch (error) {
                failureCount++;
                console.error(`Error preparing push for user ${user._id}:`, error);
            }
        }

        // Wait for all push notifications to complete
        await Promise.allSettled(pushPromises);

        console.log(`Push broadcast completed: ${successCount} sent, ${failureCount} failed`);

        res.status(200).json({
            message: 'Push notifications sent',
            sent: successCount,
            failed: failureCount,
            total: users.length
        });

    } catch (error) {
        console.error('Push broadcast error:', error);
        res.status(500).json({ error: 'Failed to send push notifications' });
    }
});

// Send push notification to specific user
router.post('/send/:userId', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { userId } = req.params;
        const { title, message, type } = req.body;

        const user = await User.findById(userId);
        if (!user || !user.pushSubscription) {
            return res.status(404).json({ error: 'User not found or not subscribed to push notifications' });
        }

        const payload = JSON.stringify({
            title: title || 'Crisis Pulse Alert',
            body: message,
            type: type || 'info',
            timestamp: new Date().toISOString(),
            url: '/app/disaster-feed'
        });

        await webpush.sendNotification(user.pushSubscription, payload);

        res.status(200).json({ message: 'Push notification sent successfully' });
    } catch (error) {
        console.error('Push send error:', error);

        if (error.statusCode === 410 || error.statusCode === 404) {
            // Remove invalid subscription
            await User.findByIdAndUpdate(req.params.userId, {
                pushSubscription: null,
                pushEnabled: false
            });
            return res.status(410).json({ error: 'Push subscription expired' });
        }

        res.status(500).json({ error: 'Failed to send push notification' });
    }
});

module.exports = router;
