const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

// GET /api/users/profile - Current user profile (matching test expectations)
router.get('/profile', authMiddleware, userController.getCurrentUser);

// GET /api/users/me - Current user profile (matching README spec)
router.get('/me', authMiddleware, userController.getCurrentUser);

// PUT /api/users/profile - Update current user profile (matching test expectations)
router.put('/profile', authMiddleware, userController.updateCurrentUserProfile);

// GET /api/users/nearby/:city - Users by location (public access for emergency coordination)
router.get('/nearby/:city', userController.getUsersByLocation);

// GET /api/users/:userId/points - User points (public access for leaderboard)
router.get('/:userId/points', userController.getUserPoints);

// PUT /api/users/me - Update current user (matching frontend usage)
router.put('/me', authMiddleware, userController.updateCurrentUserProfile);

// Get user by ID (admin only for privacy)
router.get('/:id', authMiddleware, authorize('admin'), userController.getUserById);

// Update user profile (admin only)
router.patch('/:id', authMiddleware, authorize('admin'), userController.updateUser);

// Admin routes - require authentication first
router.get('/', authMiddleware, authorize('admin'), userController.getUsers);
router.delete('/:id', authMiddleware, authorize('admin'), userController.deleteUser);

module.exports = router;