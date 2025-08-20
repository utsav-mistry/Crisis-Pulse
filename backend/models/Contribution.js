const mongoose = require('mongoose');

const contributionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    disasterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Disaster' },
    item: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, default: 'pieces' },
    category: { type: String, enum: ['food', 'water', 'medical', 'clothing', 'shelter', 'other'], default: 'other' },
    status: { type: String, enum: ['pending', 'collected', 'delivered'], default: 'pending' },
    deliveryMethod: { type: String, enum: ['pickup', 'drop-off'], default: 'drop-off' },
    contactInfo: {
        phone: String,
        address: String
    },
    pointsEarned: { type: Number, default: 0 },
    verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Contribution', contributionSchema);
