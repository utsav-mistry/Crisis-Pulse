const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../middleware/authMiddleware');
const { getAnalytics, getAiInsights } = require('../controllers/analyticsController');

// Protect all analytics routes for admin users
router.use(authMiddleware);
router.use(authorize('admin'));

// System-wide analytics
router.get('/', getAnalytics);

// Live AI insights
router.get('/insights', getAiInsights);

module.exports = router;
