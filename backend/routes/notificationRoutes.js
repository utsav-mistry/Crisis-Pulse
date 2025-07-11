const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const User = require('../models/User');
const verifyToken = require('../middleware/authMiddleware');
const sendEmail = require('../utils/sendEmail');
const getAdviceFromGPT = require('../utils/getLLMAvice');

// POST /api/notifications/broadcast
router.post('/broadcast', verifyToken, async (req, res) => {
    try {
        const { type, location, severity } = req.body;

        // Step 1: Generate safety advice from GPT
        const advice = await getAdviceFromGPT(type, location.city);

        // Step 2: Create and save notification
        const msg = `${type.toUpperCase()} expected in ${location.city} (${severity})`;
        const notification = await Notification.create({
            type,
            location,
            severity,
            message: msg,
            advice
        });

        // Step 3: Emit via Socket.io
        const io = req.app.get('socketio');
        io.emit('new_disaster_alert', notification);

        // Step 4: Email all registered users
        const users = await User.find({}, 'email');
        for (const u of users) {
            await sendEmail(u.email, `Alert: ${type}`, `${msg}\n\n${advice}`);
        }

        res.status(200).json({ message: 'Notification broadcasted', notification });
    } catch (err) {
        res.status(500).json({ error: 'Notification failed' });
    }
});

// GET /api/notifications/latest
router.get('/latest', async (req, res) => {
    const latest = await Notification.findOne().sort({ createdAt: -1 });
    res.json(latest);
});

module.exports = router;
