const cron = require('node-cron');
const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

const fetchDisasterPredictions = async (io) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Running simple disaster prediction cron job`);

    try {
        // Simple data for the prediction request - match disaster_ai format
        const latestData = {
            location: 'Delhi, India',
            disaster_type: 'flood',
            model_preference: 'RandomForest'
        };

        const response = await axios.post(`${AI_SERVICE_URL}/api/predict/`, latestData);

        const prediction = response.data;

        if (prediction && prediction.predictions) {
            console.log(`[${timestamp}] Received ${prediction.predictions.length} predictions from disaster_ai`);
            console.log(`[${timestamp}] Confidence Score: ${prediction.confidence_score}`);
            
            // Emit the prediction data to frontend - match disaster_ai response format
            if (io) {
                io.emit('new-ai-prediction', {
                    predictions: prediction.predictions,
                    confidence_score: prediction.confidence_score,
                    model_used: prediction.model_used,
                    timestamp: new Date().toISOString()
                });
            }
        }
    } catch (error) {
        console.error(`[${timestamp}] Error in disaster prediction cron job:`, error.message);
    }
};

// Schedule the cron job to run every 10 minutes for college project
const scheduleDisasterAICron = (io) => {
    cron.schedule('*/10 * * * *', () => fetchDisasterPredictions(io));
};

module.exports = { scheduleDisasterAICron };
