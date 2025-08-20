const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Admin creation lock - set to false after first admin is created
let ADMIN_CREATION_LOCKED = false;

// Create first admin (one-time setup)
const createFirstAdmin = async (req, res) => {
    try {
        // Check if admin creation is locked
        if (ADMIN_CREATION_LOCKED) {
            return res.status(403).json({
                message: 'Admin creation is locked. First admin already exists.'
            });
        }

        // Check if any admin already exists
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (existingAdmin) {
            ADMIN_CREATION_LOCKED = true;
            return res.status(400).json({
                message: 'Admin already exists. Admin creation is now locked.'
            });
        }

        const { name, email, password, adminKey } = req.body;

        // Validate admin creation key
        const ADMIN_CREATION_KEY = process.env.ADMIN_CREATION_KEY || 'crisis-pulse-admin-2025';
        if (adminKey !== ADMIN_CREATION_KEY) {
            return res.status(403).json({
                message: 'Invalid admin creation key'
            });
        }

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'Name, email, and password are required'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: 'Password must be at least 6 characters long'
            });
        }

        // Check if user with email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: 'User with this email already exists'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create admin user
        const admin = new User({
            name,
            email,
            password: hashedPassword,
            role: 'admin',
            isActive: true
        });

        await admin.save();

        // Lock admin creation after first admin is created
        ADMIN_CREATION_LOCKED = true;

        // Generate JWT token
        const token = jwt.sign(
            { id: admin._id, role: admin.role },
            process.env.JWT_SECRET || 'your-super-secret-jwt-key-here-change-in-production',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'First admin created successfully. Admin creation is now locked.',
            token,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            }
        });

    } catch (error) {
        console.error('Error creating first admin:', error);
        res.status(500).json({
            message: 'Server error during admin creation',
            error: error.message
        });
    }
};

// Check admin creation status
const getAdminCreationStatus = async (req, res) => {
    try {
        const adminExists = await User.findOne({ role: 'admin' });

        res.json({
            adminExists: !!adminExists,
            creationLocked: ADMIN_CREATION_LOCKED || !!adminExists,
            message: adminExists ?
                'Admin already exists. Use login to access admin features.' :
                'No admin found. Use admin creation endpoint with valid key.'
        });
    } catch (error) {
        console.error('Error checking admin status:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

// Reset admin creation lock (development only)
const resetAdminCreationLock = async (req, res) => {
    if (process.env.NODE_ENV !== 'development') {
        return res.status(403).json({
            message: 'This endpoint is only available in development mode'
        });
    }

    try {
        const { resetKey } = req.body;
        const RESET_KEY = process.env.ADMIN_RESET_KEY || 'crisis-pulse-reset-2025';

        if (resetKey !== RESET_KEY) {
            return res.status(403).json({
                message: 'Invalid reset key'
            });
        }

        // Delete all admin users from database
        const deleteResult = await User.deleteMany({ role: 'admin' });

        // Reset the lock
        ADMIN_CREATION_LOCKED = false;

        res.json({
            message: 'Admin creation lock reset successfully',
            creationLocked: ADMIN_CREATION_LOCKED,
            adminsDeleted: deleteResult.deletedCount
        });
    } catch (error) {
        console.error('Error resetting admin creation lock:', error);
        res.status(500).json({
            message: 'Server error during reset',
            error: error.message
        });
    }
};

module.exports = {
    createFirstAdmin,
    getAdminCreationStatus,
    resetAdminCreationLock
};
