const mongoose = require('mongoose');

const disasterSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, required: true, enum: ['flood', 'earthquake', 'fire', 'storm', 'drought', 'cyclone', 'wildfire', 'landslide', 'tsunami', 'heatwave', 'other'] },
    location: {
        city: String,
        state: String,
        address: String,
        coordinates: {
            lat: Number,
            lon: Number
        }
    },
    severity: { type: String, enum: ['low', 'medium', 'high', 'extreme'], default: 'medium' },
    status: { type: String, enum: ['active', 'resolved', 'monitoring'], default: 'active' },
    source: { type: String, enum: ['ai', 'external', 'manual'], default: 'manual' },
    predictionDate: { type: Date, default: Date.now },
    raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    crpfNotified: { type: Boolean, default: false },
    crpfNotificationDate: { type: Date },
    affectedPeople: { type: Number, default: 0 },
    resourcesNeeded: [String],
    verificationStatus: { type: String, enum: ['pending', 'verified', 'false_alarm'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Disaster', disasterSchema);
