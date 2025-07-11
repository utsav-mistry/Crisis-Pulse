const mongoose = require('mongoose');

const disasterSchema = new mongoose.Schema({
    type: { type: String, required: true },           // e.g. flood, drought
    location: {
        city: String,
        state: String,
        coordinates: {
            lat: Number,
            lon: Number
        }
    },
    severity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    source: { type: String, enum: ['ai', 'external', 'manual'], default: 'manual' },
    predictionDate: { type: Date, required: true },
    raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Disaster', disasterSchema);
