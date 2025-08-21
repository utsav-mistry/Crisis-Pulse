const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../middleware/authMiddleware');
const {
    createVolunteerHelp,
    getAllVolunteerHelps,
    getPendingVolunteerHelps,
    getVolunteerHelpsByVolunteer,
    getVolunteerHelpById,
    verifyVolunteerHelp,
    signUpForHelp,
    getActiveDisastersForHelp
} = require('../controllers/volunteerHelpController');

// Create a new volunteer help log - volunteer only
router.post('/', authMiddleware, authorize('volunteer'), createVolunteerHelp);

// Get all volunteer help logs - admin only
router.get('/', authMiddleware, authorize('admin', 'crpf'), getAllVolunteerHelps);

// Get pending volunteer help logs - admin only
router.get('/pending', authMiddleware, authorize('admin', 'crpf'), getPendingVolunteerHelps);

// Get volunteer help logs by the logged-in volunteer
router.get('/my-help-logs', authMiddleware, authorize('volunteer'), getVolunteerHelpsByVolunteer);

// Get active disasters that need volunteer help
router.get('/active-disasters', authMiddleware, getActiveDisastersForHelp);

// Sign up for a help ticket - volunteer only
router.post('/sign-up', authMiddleware, authorize('volunteer'), signUpForHelp);

// Get a single volunteer help log by ID - admin or the volunteer who created it
router.get('/:id', authMiddleware, getVolunteerHelpById);

// Verify or reject a volunteer help log - admin only
router.put('/:id/verify', authMiddleware, authorize('admin', 'crpf'), verifyVolunteerHelp);

module.exports = router;