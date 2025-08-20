const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Create a new user
exports.createUser = async (req, res) => {
    try {
        const { name, email, password, role, location, volunteerExperience, motivation } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'Email already exists' });
        
        const hashedPassword = await bcrypt.hash(password, 12);
        const userData = { 
            name, 
            email, 
            password: hashedPassword, 
            role: role || 'user', 
            location 
        };

        // Add volunteer-specific fields
        if (role === 'volunteer') {
            userData.volunteerExperience = volunteerExperience;
            userData.motivation = motivation;
            userData.volunteerStatus = 'pending';
        }

        const user = new User(userData);
        await user.save();

        // Generate JWT token
        const jwt = require('jsonwebtoken');
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET || 'your-super-secret-jwt-key-here-change-in-production', 
            { expiresIn: '7d' }
        );

        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                volunteerStatus: user.volunteerStatus
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get current user profile
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get users by location (nearby users)
exports.getUsersByLocation = async (req, res) => {
    try {
        const { city } = req.params;
        const users = await User.find({ 
            'location.city': { $regex: city, $options: 'i' } 
        }).select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get user points
exports.getUserPoints = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId).select('name points');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ user: user.name, points: user.points });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all users
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get user by ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update user
exports.updateUser = async (req, res) => {
    try {
        const { name, email, password, role, location } = req.body;
        const updateData = { name, email, role, location };
        if (password) updateData.password = await bcrypt.hash(password, 10);
        const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get users by location
exports.getUsersByLocation = async (req, res) => {
    try {
        const { city } = req.params;
        const users = await User.find({
            'location.city': { $regex: city, $options: 'i' }
        }).select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get user points
exports.getUserPoints = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('points name');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({
            userId: user._id,
            name: user.name,
            points: user.points
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update current user profile
exports.updateCurrentUserProfile = async (req, res) => {
    try {
        const { name, email, phone, location } = req.body;
        const updateData = { name, email, phone, location };
        
        // Check if email is being changed and if it already exists
        if (email && email !== req.user.email) {
            const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } });
            if (existingUser) {
                return res.status(400).json({ message: 'Email already exists' });
            }
        }
        
        const user = await User.findByIdAndUpdate(req.user.id, updateData, { 
            new: true,
            runValidators: true 
        }).select('-password');
        
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};