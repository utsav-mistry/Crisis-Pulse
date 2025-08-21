const jwt = require('jsonwebtoken');
const User = require('../models/User');



const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-here-change-in-production');
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({ message: 'Invalid token.' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token.' });
    }
};

// Admin-only middleware
const requireAdmin = async (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }
    next();
};

// Role-based authorization middleware
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Access denied. No user found.' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `Access denied. Required roles: ${roles.join(', ')}. Your role: ${req.user.role}` 
            });
        }

        next();
    };
};

module.exports = {
    authMiddleware,
    requireAdmin,
    authorize
};
