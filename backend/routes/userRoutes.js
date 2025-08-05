const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Protected routes (require authentication)
router.use(authMiddleware);

// Get current user profile
router.get('/me', userController.getCurrentUser);

// Get user by ID
router.get('/:id', userController.getUserById);

// Update user profile
router.patch('/:id', userController.updateUser);

// Get users by location
router.get('/nearby/:city', userController.getUsersByLocation);

// Get user points
router.get('/:userId/points', userController.getUserPoints);

// Admin routes
router.get('/', authMiddleware.requireAdmin, userController.getUsers);
router.delete('/:id', authMiddleware.requireAdmin, userController.deleteUser);

module.exports = router; 