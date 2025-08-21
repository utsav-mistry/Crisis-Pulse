const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null // Null for guest users
    },
    socketId: {
        type: String,
        required: true,
        unique: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    isGuest: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

subscriptionSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Subscription', subscriptionSchema);
