const mongoose = require('mongoose');

const TestLogSchema = new mongoose.Schema({
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: ['raise_disaster', 'send_notification', 'trigger_volunteer_ticket', 'simulate_ai_advice']
    },
    details: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('TestLog', TestLogSchema);
