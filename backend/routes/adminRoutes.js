const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

// All routes require admin authentication
router.use(authMiddleware);
router.use(authorize('admin'));

// User management routes
router.get('/users', adminController.getAllUsers);
router.post('/users/admin', adminController.createAdmin);
router.patch('/users/:userId/ban', adminController.toggleUserBan);

// Volunteer management routes
router.get('/volunteers/stats', adminController.getVolunteerStats);
router.patch('/volunteers/:userId/approve', adminController.approveVolunteer);
router.patch('/volunteers/:userId/reject', adminController.rejectVolunteer);
router.patch('/volunteers/:userId/suspend', adminController.suspendVolunteer);

module.exports = router;
