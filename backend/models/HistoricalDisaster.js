const mongoose = require('mongoose');

const historicalDisasterSchema = new mongoose.Schema({
    type: { type: String, required: true }, // e.g., flood, drought
    location: {
        city: String,
        state: String,
        coordinates: {
            lat: Number,
            lon: Number
        }
    },
    date: { type: Date, required: true },
    severity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    description: String
}, { timestamps: true });

module.exports = mongoose.model('HistoricalDisaster', historicalDisasterSchema); 