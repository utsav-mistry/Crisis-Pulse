const mongoose = require('mongoose');

const aiInsightSchema = new mongoose.Schema({
    type: { type: String, required: true, enum: ['AI_PREDICTION', 'AI_ERROR'] },
    status: { type: String, required: true, enum: ['SUCCESS', 'ERROR'] },
    data: { type: mongoose.Schema.Types.Mixed },
    request: { type: mongoose.Schema.Types.Mixed },
    error: { type: String },
    message: { type: String },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AIInsight', aiInsightSchema);
