const express = require('express');
const router = express.Router();
const { subscribe, unsubscribe, getSubscriptions } = require('../controllers/subscriptionController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

// Public routes
router.post('/subscribe', subscribe);
router.post('/unsubscribe', unsubscribe);

// Admin route
router.get('/', authMiddleware, authorize('admin'), getSubscriptions);

module.exports = router;
