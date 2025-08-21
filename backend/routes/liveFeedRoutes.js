const express = require('express');
const router = express.Router();

// Simple in-memory storage for live feed data
let predictions = [];
const MAX_PREDICTIONS = 50;

// Receive live feed data from Django AI service
router.post('/receive', (req, res) => {
    try {
        const liveData = req.body;
        const io = req.app.get('io');
        
        // Simple validation
        if (!liveData.type || !liveData.severity || !liveData.location) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Format the data
        const prediction = {
            id: Date.now(),
            type: liveData.type,
            location: liveData.location,
            severity: liveData.severity,
            confidence: liveData.confidence || 0.7,
            probability: liveData.probability || 0.5,
            timestamp: liveData.timestamp || new Date().toISOString(),
            metadata: {
                weather_conditions: liveData.weather_conditions || {},
                risk_factors: liveData.risk_factors || []
            }
        };

        // Add to in-memory storage (limited size)
        predictions.unshift(prediction);
        if (predictions.length > MAX_PREDICTIONS) {
            predictions = predictions.slice(0, MAX_PREDICTIONS);
        }

        // Emit to all connected clients
        if (io) {
            io.emit('new-ai-prediction', {
                data: {
                    predictions: [prediction],
                    confidence_score: prediction.confidence,
                    model_used: 'live_feed'
                },
                createdAt: prediction.timestamp
            });
        }

        res.json({ status: 'success', message: 'Data received' });
    } catch (error) {
        console.error('Error processing live feed data:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get recent predictions (for initial page load)
router.get('/recent', (req, res) => {
    res.json({ predictions: predictions.slice(0, 10) });
});

// Clear all predictions (for testing)
router.post('/clear', (req, res) => {
    predictions = [];
    res.json({ status: 'success', message: 'Predictions cleared' });
});

module.exports = router;
