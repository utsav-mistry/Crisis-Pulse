const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    type: String,        // e.g. flood
    location: {
        city: String,
        state: String
    },
    severity: String,    // low / medium / high
    message: String,
    advice: String
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
