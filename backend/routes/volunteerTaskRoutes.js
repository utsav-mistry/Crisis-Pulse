const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../middleware/authMiddleware');
const {
    getOpenTasks,
    getMyTasks,
    claimTask,
    submitTask,
    getTasksForVerification,
    verifyTask
} = require('../controllers/volunteerTaskController');

// Volunteer routes
router.route('/')
    .get(authMiddleware, authorize('volunteer'), getOpenTasks);

router.route('/my-tasks')
    .get(authMiddleware, authorize('volunteer'), getMyTasks);

router.route('/:id/claim')
    .post(authMiddleware, authorize('volunteer'), claimTask);

router.route('/:id/submit')
    .post(authMiddleware, authorize('volunteer'), submitTask);

// Admin routes
router.route('/admin')
    .get(authMiddleware, authorize('admin'), getTasksForVerification);

router.route('/admin/:id/verify')
    .post(authMiddleware, authorize('admin'), verifyTask);

module.exports = router;
