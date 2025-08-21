const mongoose = require('mongoose');

const volunteerTaskSchema = new mongoose.Schema({
    disaster: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Disaster',
        required: true
    },
    volunteer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null // Null until a volunteer claims it
    },
    taskType: {
        type: String,
        enum: ['damage_assessment', 'supply_distribution', 'rescue_operation', 'shelter_management'],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['open', 'claimed', 'submitted', 'approved', 'rejected', 'expired'],
        default: 'open'
    },
    claimedAt: {
        type: Date
    },
    deadline: {
        type: Date
    },
    proof: {
        type: String // URL to the uploaded image or report
    },
    adminFeedback: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('VolunteerTask', volunteerTaskSchema);
