const express = require('express');
const router = express.Router();
const Contribution = require('../models/Contribution');
const User = require('../models/User');
const verifyToken = require('../middleware/authMiddleware');

// Helper: points system
const getPoints = (item, quantity) => {
    const pointTable = {
        food: 10,
        water: 8,
        medicine: 12,
        clothes: 6
    };
    return (pointTable[item] || 5) * quantity;
};

// POST /api/contribute
router.post('/', verifyToken, async (req, res) => {
    try {
        const { disasterId, item, quantity } = req.body;

        const points = getPoints(item, quantity);
        const contribution = await Contribution.create({
            userId: req.user.id,
            disasterId,
            item,
            quantity,
            pointsEarned: points
        });

        // Update user points
        await User.findByIdAndUpdate(req.user.id, { $inc: { points: points } });

        res.status(201).json({
            message: 'Contribution recorded',
            contribution,
            pointsEarned: points
        });
    } catch (err) {
        res.status(500).json({ error: 'Contribution failed' });
    }
});

// GET /api/contributions/user/:userId
router.get('/user/:userId', async (req, res) => {
    try {
        const list = await Contribution.find({ userId: req.params.userId }).populate('disasterId');
        res.json(list);
    } catch (err) {
        res.status(500).json({ error: 'Could not fetch contributions' });
    }
});

module.exports = router;
