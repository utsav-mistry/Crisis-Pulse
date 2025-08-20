const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getUserPoints,
    getLeaderboard,
    getUserAchievements,
    getPointsHistory
} = require('../controllers/pointsController');

// Get current user's points and ranking
router.get('/me', protect, getUserPoints);

// Get user points (matching test expectations)
router.get('/user', protect, getUserPoints);

// Get leaderboard
router.get('/leaderboard', getLeaderboard);

// Get user achievements
router.get('/achievements', protect, getUserAchievements);

// Get points history/activity
router.get('/history', protect, getPointsHistory);

module.exports = router;
