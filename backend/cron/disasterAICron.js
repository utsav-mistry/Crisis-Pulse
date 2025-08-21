const cron = require('node-cron');
const axios = require('axios');
const { addAiInsight } = require('../controllers/analyticsController');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

const fetchDisasterPredictions = async (io) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Running disaster prediction cron job`);

    try {
        // Mock data for the prediction request
        const latestData = {
            location: { lat: 28.6139, lon: 77.2090 }, // Delhi
            weatherData: {
                temperature: 35,
                humidity: 70,
                wind_speed: 15,
                precipitation: 5
            },
            historicalData: {
                recent_disasters: 2,
                avg_severity: 'medium'
            }
        };

        const response = await axios.post(`${AI_SERVICE_URL}/api/predict/`, latestData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.AI_SERVICE_AUTH_TOKEN}`
            }
        });

        const prediction = response.data;

        if (prediction) {
            console.log(`[${timestamp}] Received prediction:`, prediction);
            console.log(`[${timestamp}] Disaster AI Predictions Received:`);
            console.log(JSON.stringify(prediction, null, 2));
            
            // Emit the prediction data to the live feed
            if (io) {
                io.emit('new-ai-prediction', {
                    data: prediction,
                    createdAt: new Date().toISOString()
                });
            }

            const logData = {
                type: 'AI_PREDICTION',
                status: 'SUCCESS',
                data: prediction,
                request: latestData,
                message: 'Disaster AI Predictions Received',
                timestamp: new Date()
            };

            // Store the insight for live feed
            addAiInsight(logData);

            // Check each prediction for high-risk conditions and auto-create disasters
            if (prediction.predictions && prediction.predictions.length > 0) {
                for (const pred of prediction.predictions) {
                    // Only trigger cron job for high severity AND high accuracy
                    const shouldTrigger = (
                        (pred.severity === 'high' || pred.severity === 'critical') && 
                        (pred.confidence >= 0.8 || prediction.confidence_score >= 0.8) &&
                        pred.probability >= 0.7
                    );

                    if (shouldTrigger) {
                        console.log(`[${timestamp}] High-risk disaster predicted with high confidence. Triggering auto-creation...`);
                        console.log(`[${timestamp}] Prediction details: Type=${pred.type}, Severity=${pred.severity}, Confidence=${pred.confidence || prediction.confidence_score}, Probability=${pred.probability}`);

                        try {
                            // Call internal API to create the disaster
                            await axios.post(`${API_BASE_URL}/api/disasters/create-from-ai`, {
                                type: pred.type.toLowerCase(),
                                location: pred.location || 'Unknown Location',
                                description: `AI-detected ${pred.type} with ${(pred.confidence || prediction.confidence_score).toFixed(2)} confidence and ${pred.probability.toFixed(2)} probability.`,
                                severity: pred.severity,
                                source: 'AI Prediction System',
                                metadata: {
                                    model_used: pred.model_used || prediction.model_used,
                                    confidence: pred.confidence || prediction.confidence_score,
                                    probability: pred.probability,
                                    predicted_date: pred.predicted_date
                                }
                            }, {
                                headers: {
                                    'Authorization': `Bearer ${process.env.INTERNAL_API_TOKEN}`
                                }
                            });
                            
                            console.log(`[${timestamp}] Successfully created disaster from AI prediction`);
                        } catch (createError) {
                            console.error(`[${timestamp}] Error creating disaster from AI prediction:`, createError.message);
                        }
                    }
                }
            }
        }
    } catch (error) {
        const errorMessage = error.response ? JSON.stringify(error.response.data) : error.message;
        console.error(`[${timestamp}] Error in disaster prediction cron job:`, errorMessage);

        const errorData = {
            type: 'AI_PREDICTION',
            status: 'ERROR',
            error: errorMessage,
            message: 'Error fetching disaster predictions'
        };

        // Store the error for live feed
        addAiInsight(errorData);
    }
};

// Schedule the cron job to run every 5 minutes
const scheduleDisasterAICron = (io) => {
    cron.schedule('*/5 * * * *', () => fetchDisasterPredictions(io));
};

module.exports = { scheduleDisasterAICron };
