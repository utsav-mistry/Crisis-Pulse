const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
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
router.post('/', protect, authorize('volunteer'), createVolunteerHelp);

// Get all volunteer help logs - admin only
router.get('/', protect, authorize('admin'), getAllVolunteerHelps);

// Get pending volunteer help logs - admin only
router.get('/pending', protect, authorize('admin'), getPendingVolunteerHelps);

// Get volunteer help logs by the logged-in volunteer
router.get('/my-help-logs', protect, authorize('volunteer'), getVolunteerHelpsByVolunteer);

// Get active disasters that need volunteer help
router.get('/active-disasters', protect, getActiveDisastersForHelp);

// Sign up for a help ticket - volunteer only
router.post('/sign-up', protect, authorize('volunteer'), signUpForHelp);

// Get a single volunteer help log by ID - admin or the volunteer who created it
router.get('/:id', protect, getVolunteerHelpById);

// Verify or reject a volunteer help log - admin only
router.put('/:id/verify', protect, authorize('admin'), verifyVolunteerHelp);

module.exports = router;