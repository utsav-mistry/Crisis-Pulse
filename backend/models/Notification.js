const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: { // Can be a user ID, or a role like 'admin' or 'all' for broadcast
        type: String,
        required: true,
        index: true
    },
    type: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    data: { // For extra context like taskId, disasterId
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    link: {
        type: String // e.g., '/tasks/123' or '/disasters/456'
    },
    read: {
        type: Boolean,
        default: false
    },
    
    // Existing fields for disaster alerts, can be deprecated later
    location: {
        city: String,
        state: String
    },
    severity: String,
    advice: String
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
