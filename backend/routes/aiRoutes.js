const express = require('express');
const router = express.Router();
const axios = require('axios');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

// AI Service base URL (Django service)
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// POST /api/predict - Simple disaster prediction (authenticated users only)
router.post('/predict', authMiddleware, async (req, res) => {
    try {
        const { location, weatherData, historicalData } = req.body;
        
        // Forward request to Django AI service
        const response = await axios.post(`${AI_SERVICE_URL}/api/predict/`, {
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

// POST /api/llm-advice - Simple AI safety advice (authenticated users only)
router.post('/llm-advice', authMiddleware, async (req, res) => {
    try {
        const { disasterType, severity, location } = req.body;
        
        // Forward request to Django AI service - match exact format
        const response = await axios.post(`${AI_SERVICE_URL}/api/llm-advice/`, {
            type: disasterType,  // disaster_ai expects 'type'
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

// GET /api/weather/forecast - Simple weather forecasting (authenticated users only)
router.get('/weather/forecast', authMiddleware, async (req, res) => {
    try {
        const { location, days = 5 } = req.query;
        
        // Forward request to Django AI service
        const response = await axios.get(`${AI_SERVICE_URL}/api/weather/forecast/`, {
            params: { location, days }
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

// GET /api/analytics/disaster-trends - Simple trend analysis (authenticated users only)
router.get('/analytics/disaster-trends', authMiddleware, async (req, res) => {
    try {
        // Forward request to Django AI service
        const response = await axios.get(`${AI_SERVICE_URL}/api/analytics/disaster-trends/`);
        
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
