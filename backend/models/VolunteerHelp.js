const mongoose = require('mongoose');

const volunteerHelpSchema = new mongoose.Schema({
    volunteerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    disasterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Disaster',
        required: true
    },
    location: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    foodPacketsDistributed: {
        type: Number,
        required: true,
        min: 1
    },
    photos: {
        type: [String], // Array of photo URLs
        validate: {
            validator: function(photos) {
                return photos.length >= 5; // Require at least 5 photos
            },
            message: 'At least 5 photos are required as proof of help'
        },
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'verified', 'rejected', 'expired', 'signed_up'],
        default: 'pending'
    },
    isSignedUp: {
        type: Boolean,
        default: false
    },
    signUpDate: {
        type: Date,
        default: null
    },
    expirationDate: {
        type: Date,
        default: null
    },
    scoreDeducted: {
        type: Boolean,
        default: false
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    verifiedAt: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const VolunteerHelp = mongoose.model('VolunteerHelp', volunteerHelpSchema);

module.exports = VolunteerHelp;