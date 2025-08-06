const mongoose = require('mongoose');

const crpfNotificationSchema = new mongoose.Schema({
    disasterId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Disaster', 
        required: true 
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
    notifiedAt: { 
        type: Date, 
        default: null 
    }
}, { timestamps: true });

module.exports = mongoose.model('CrpfNotification', crpfNotificationSchema);