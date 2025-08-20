const mongoose = require('mongoose');

const crpfNotificationSchema = new mongoose.Schema({
    disasterId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Disaster', 
        required: false // Allow manual notifications without disaster reference
    },
    notifiedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['pending', 'notified'], 
        default: 'pending' 
    },
    title: {
        type: String,
        required: false // For manual notifications
    },
    message: {
        type: String,
        required: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    crpfUnits: [{
        type: String
    }],
    notifiedAt: { 
        type: Date, 
        default: null 
    }
}, { timestamps: true });

module.exports = mongoose.model('CrpfNotification', crpfNotificationSchema);