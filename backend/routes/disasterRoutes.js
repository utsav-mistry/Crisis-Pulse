const express = require('express');
const router = express.Router();
const Disaster = require('../models/Disaster');
const verifyToken = require('../middleware/authMiddleware');

// [POST] /api/disasters/raise
router.post('/raise', verifyToken, async (req, res) => {
    try {
        const { type, location, severity, predictionDate, source } = req.body;
        const disaster = await Disaster.create({
            type,
            location,
            severity,
            predictionDate,
            source,
            raisedBy: req.user.id
        });
        res.status(201).json(disaster);
    } catch (err) {
        res.status(500).json({ error: 'Disaster raise failed' });
    }
});

// [GET] /api/disasters
router.get('/', async (req, res) => {
    const disasters = await Disaster.find().sort({ predictionDate: -1 });
    res.json(disasters);
});

// [GET] /api/disasters/:id
router.get('/:id', async (req, res) => {
    const disaster = await Disaster.findById(req.params.id);
    if (!disaster) return res.status(404).json({ error: 'Disaster not found' });
    res.json(disaster);
});

module.exports = router;
