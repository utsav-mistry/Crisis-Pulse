const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, requireAdmin } = require('../middleware/authMiddleware');

// GET /api/users/profile - Current user profile (matching test expectations)
router.get('/profile', authMiddleware, userController.getCurrentUser);

// GET /api/users/me - Current user profile (matching README spec)
router.get('/me', authMiddleware, userController.getCurrentUser);

// PUT /api/users/profile - Update current user profile (matching test expectations)
router.put('/profile', authMiddleware, userController.updateCurrentUserProfile);

// GET /api/users/nearby/:city - Users by location (matching README spec)
router.get('/nearby/:city', userController.getUsersByLocation);

// GET /api/users/:userId/points - User points (matching README spec)
router.get('/:userId/points', userController.getUserPoints);

// PUT /api/users/me - Update current user (matching frontend usage)
router.put('/me', authMiddleware, userController.updateCurrentUserProfile);

// Get user by ID
router.get('/:id', userController.getUserById);

// Update user profile
router.patch('/:id', userController.updateUser);

// Admin routes - require authentication first
router.get('/', authMiddleware, requireAdmin, userController.getUsers);
router.delete('/:id', authMiddleware, requireAdmin, userController.deleteUser);

module.exports = router;