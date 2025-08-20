const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    role: { 
        type: String, 
        enum: ['user', 'volunteer', 'admin'], 
        default: 'user' 
    },
    location: {
        city: String,
        state: String
    },
    points: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    
    // Volunteer-specific fields
    volunteerStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'suspended'],
        default: function() {
            return this.role === 'volunteer' ? 'pending' : undefined;
        }
    },
    volunteerExperience: { type: String },
    motivation: { type: String },
    
    
    // Admin approval tracking
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    rejectionReason: { type: String },
    
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
