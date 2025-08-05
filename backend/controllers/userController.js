const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Create a new user
exports.createUser = async (req, res) => {
    try {
        const { name, email, password, role, location } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'Email already exists' });
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword, role, location });
        await user.save();
        res.status(201).json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get current user profile
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
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