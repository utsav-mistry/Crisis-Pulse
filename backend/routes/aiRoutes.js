const express = require('express');
const router = express.Router();
const axios = require('axios');
const { authMiddleware } = require('../middleware/authMiddleware');
const { aiLimiter } = require('../middleware/rateLimiter');

// AI Service base URL (Django service)
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// POST /api/predict - Disaster prediction
router.post('/predict', async (req, res) => {
    try {
        const { location, weatherData, historicalData } = req.body;
        
        // Forward request to Django AI service
        const response = await axios.post(`${AI_SERVICE_URL}/api/predict`, {
            location,
            weather_data: weatherData,
            historical_data: historicalData
        });
        
        res.json(response.data);
    } catch (error) {
        console.error('AI Prediction Error:', error.message);
        res.status(500).json({ 
            message: 'Prediction service unavailable',
            error: error.message 
        });
    }
});

// POST /api/llm-advice - AI safety advice
router.post('/llm-advice', async (req, res) => {
    try {
        const { disasterType, severity, location } = req.body;
        
        // Forward request to Django AI service
        const response = await axios.post(`${AI_SERVICE_URL}/api/llm-advice`, {
            disaster_type: disasterType,
            severity,
            location
        });
        
        res.json(response.data);
    } catch (error) {
        console.error('LLM Advice Error:', error.message);
        res.status(500).json({ 
            message: 'AI advice service unavailable',
            error: error.message 
        });
    }
});

// GET /api/weather/forecast - Weather forecasting
router.get('/weather/forecast/:location', authMiddleware, aiLimiter, async (req, res) => {
    try {
        const { lat, lon, days = 5 } = req.query;
        
        if (!lat || !lon) {
            return res.status(400).json({ message: 'Latitude and longitude are required' });
        }
        
        // Forward request to Django AI service
        const response = await axios.get(`${AI_SERVICE_URL}/api/weather/forecast`, {
            params: { lat, lon, days }
        });
        
        res.json(response.data);
    } catch (error) {
        console.error('Weather Forecast Error:', error.message);
        res.status(500).json({ 
            message: 'Weather service unavailable',
            error: error.message 
        });
    }
});

// GET /api/analytics/disaster-trends - Trend analysis
router.get('/analytics/disaster-trends', async (req, res) => {
    try {
        const { region, timeframe = '1year', disasterType } = req.query;
        
        // Forward request to Django AI service
        const response = await axios.get(`${AI_SERVICE_URL}/api/analytics/disaster-trends`, {
            params: { region, timeframe, disaster_type: disasterType }
        });
        
        res.json(response.data);
    } catch (error) {
        console.error('Analytics Error:', error.message);
        res.status(500).json({ 
            message: 'Analytics service unavailable',
            error: error.message 
        });
    }
});

module.exports = router;
