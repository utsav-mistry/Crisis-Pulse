const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const {
    getUserPoints,
    getLeaderboard,
    getUserAchievements,
    getPointsHistory
} = require('../controllers/pointsController');

// Get current user's points and ranking
router.get('/me', authMiddleware, getUserPoints);

// Get user points (matching test expectations)
router.get('/user', authMiddleware, getUserPoints);

// Get leaderboard (authenticated users only)
router.get('/leaderboard', authMiddleware, getLeaderboard);

// Get user achievements
router.get('/achievements', authMiddleware, getUserAchievements);

// Get points history/activity
router.get('/history', authMiddleware, getPointsHistory);

module.exports = router;
