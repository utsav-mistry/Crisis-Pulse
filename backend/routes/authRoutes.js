const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Register
router.post('/register', authController.register);

// Login
router.post('/login', authController.login);

// Get current user
router.get('/me', authMiddleware, authController.getMe);

// Update profile
router.put('/profile', authMiddleware, authController.updateProfile);

// Change password
router.put('/change-password', authMiddleware, authController.changePassword);

module.exports = router;
