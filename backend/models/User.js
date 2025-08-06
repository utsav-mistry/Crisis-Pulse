const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['volunteer', 'user', 'admin'], default: 'user' },
    points: { type: Number, default: 0 },
    helpScoreDeductions: { type: Number, default: 0 },
    isBanned: { type: Boolean, default: false },
    banReason: { type: String, default: null },
    bannedAt: { type: Date, default: null },
    allowNotifications: { type: Boolean, default: false },
    notificationToken: { type: String, default: null },
    location: {
        city: String,
        state: String,
        coordinates: {
            lat: Number,
            lon: Number
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
