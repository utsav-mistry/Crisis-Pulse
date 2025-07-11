const mongoose = require('mongoose');

const contributionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    disasterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Disaster' },
    item: { type: String, required: true },
    quantity: { type: Number, required: true },
    pointsEarned: { type: Number },
}, { timestamps: true });

module.exports = mongoose.model('Contribution', contributionSchema);
