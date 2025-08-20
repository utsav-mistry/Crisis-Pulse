const express = require('express');
const router = express.Router();
const { getDashboardStats, getRecentDisasters } = require('../controllers/dashboardController');
const { authorize } = require('../middleware/authMiddleware');

// Get dashboard statistics
router.get('/stats', authorize, getDashboardStats);

// Get recent disasters
router.get('/recent-disasters', authorize, getRecentDisasters);

module.exports = router;
