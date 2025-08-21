const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');
const { getDashboardStats, getRecentDisasters } = require('../controllers/dashboardController');
const { getAnalytics, getAiInsights } = require('../controllers/analyticsController');
const testLogController = require('../controllers/testLogController');

// All admin routes require admin authentication
router.use(authMiddleware);
router.use(authorize('admin'));

// User Management
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);

// Dashboard & Analytics
router.get('/stats', adminController.getSystemStats);
router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/recent-disasters', getRecentDisasters);
router.get('/analytics', getAnalytics);
router.get('/analytics/insights', getAiInsights);

// Test Logs
router.get('/test-logs', testLogController.getTestLogs);

module.exports = router;
