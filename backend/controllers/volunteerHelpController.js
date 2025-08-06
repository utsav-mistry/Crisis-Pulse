const VolunteerHelp = require('../models/VolunteerHelp');
const User = require('../models/User');
const { broadcastPointsUpdated } = require('../sockets/socketHandler');

// Helper function to check and expire volunteer help tickets
const checkAndExpireHelpTickets = async () => {
    try {
        const now = new Date();
        
        // Find signed up help tickets that have expired
        const expiredTickets = await VolunteerHelp.find({
            isSignedUp: true,
            status: 'signed_up',
            expirationDate: { $lt: now },
            scoreDeducted: false
        });
        
        for (const ticket of expiredTickets) {
            // Mark ticket as expired
            ticket.status = 'expired';
            ticket.scoreDeducted = true;
            await ticket.save();
            
            // Deduct help score from volunteer
            const volunteer = await User.findById(ticket.volunteerId);
            volunteer.helpScoreDeductions += 1;
            
            // Ban user if they have 3 or more deductions
            if (volunteer.helpScoreDeductions >= 3) {
                volunteer.isBanned = true;
                volunteer.banReason = 'Failed to complete volunteer help after signing up 3 times';
                volunteer.bannedAt = now;
            }
            
            await volunteer.save();
        }
    } catch (error) {
        console.error('Error checking expired help tickets:', error);
    }
};

// Create a new volunteer help log
exports.createVolunteerHelp = async (req, res) => {
    try {
        const { disasterId, location, description, foodPacketsDistributed, photos } = req.body;
        const volunteerId = req.user.id;

        // Validate minimum photo requirement
        if (!photos || photos.length < 5) {
            return res.status(400).json({ 
                success: false, 
                message: 'At least 5 photos are required as proof of help' 
            });
        }

        const volunteerHelp = new VolunteerHelp({
            volunteerId,
            disasterId,
            location,
            description,
            foodPacketsDistributed,
            photos
        });

        await volunteerHelp.save();

        res.status(201).json({
            success: true,
            data: volunteerHelp,
            message: 'Help log submitted successfully. It will be verified by an admin.'
        });
    } catch (error) {
        console.error('Error creating volunteer help log:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit help log',
            error: error.message
        });
    }
};

// Get all volunteer help logs (admin only)
exports.getAllVolunteerHelps = async (req, res) => {
    try {
        // Run the expiration check before fetching data
        await checkAndExpireHelpTickets();
        
        const volunteerHelps = await VolunteerHelp.find()
            .populate('volunteerId', 'name email helpScoreDeductions isBanned')
            .populate('disasterId', 'type location severity')
            .populate('verifiedBy', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: volunteerHelps.length,
            data: volunteerHelps
        });
    } catch (error) {
        console.error('Error fetching volunteer help logs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch volunteer help logs',
            error: error.message
        });
    }
};

// Get pending volunteer help logs (admin only)
exports.getPendingVolunteerHelps = async (req, res) => {
    try {
        const pendingHelps = await VolunteerHelp.find({ status: 'pending' })
            .populate('volunteerId', 'name email')
            .populate('disasterId', 'type location severity')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: pendingHelps.length,
            data: pendingHelps
        });
    } catch (error) {
        console.error('Error fetching pending volunteer help logs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch pending volunteer help logs',
            error: error.message
        });
    }
};

// Get volunteer help logs by volunteer ID
exports.getVolunteerHelpsByVolunteer = async (req, res) => {
    try {
        const volunteerId = req.user.id;
        
        // Check if user is banned
        const user = await User.findById(volunteerId);
        if (user.isBanned) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been banned due to multiple help score deductions',
                banReason: user.banReason,
                bannedAt: user.bannedAt
            });
        }
        
        // Run the expiration check before fetching data
        await checkAndExpireHelpTickets();
        
        const volunteerHelps = await VolunteerHelp.find({ volunteerId })
            .populate('disasterId', 'type location severity')
            .populate('verifiedBy', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: volunteerHelps.length,
            data: volunteerHelps
        });
    } catch (error) {
        console.error('Error fetching volunteer help logs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch volunteer help logs',
            error: error.message
        });
    }
};

// Verify or reject a volunteer help log (admin only)
exports.verifyVolunteerHelp = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const adminId = req.user.id;

        if (!['verified', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Status must be either "verified" or "rejected"'
            });
        }

        const volunteerHelp = await VolunteerHelp.findById(id);

        if (!volunteerHelp) {
            return res.status(404).json({
                success: false,
                message: 'Volunteer help log not found'
            });
        }

        if (volunteerHelp.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `This help log has already been ${volunteerHelp.status}`
            });
        }

        // Update the volunteer help log
        volunteerHelp.status = status;
        volunteerHelp.verifiedBy = adminId;
        volunteerHelp.verifiedAt = Date.now();

        await volunteerHelp.save();

        // If verified, award points to the volunteer
        if (status === 'verified') {
            const pointsToAward = volunteerHelp.foodPacketsDistributed * 10; // 10 points per food packet
            
            const volunteer = await User.findById(volunteerHelp.volunteerId);
            volunteer.points += pointsToAward;
            await volunteer.save();

            // Broadcast points update via socket
            broadcastPointsUpdated(volunteerHelp.volunteerId, volunteer.points);
        }

        res.status(200).json({
            success: true,
            data: volunteerHelp,
            message: `Volunteer help log has been ${status}`
        });
    } catch (error) {
        console.error('Error verifying volunteer help log:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify volunteer help log',
            error: error.message
        });
    }
};

// Get a single volunteer help log by ID
exports.getVolunteerHelpById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Run the expiration check
        await checkAndExpireHelpTickets();
        
        const volunteerHelp = await VolunteerHelp.findById(id)
            .populate('volunteerId', 'name email helpScoreDeductions isBanned')
            .populate('disasterId', 'type location severity')
            .populate('verifiedBy', 'name');

        if (!volunteerHelp) {
            return res.status(404).json({
                success: false,
                message: 'Volunteer help log not found'
            });
        }

        // Check if the user is the volunteer who created this log or an admin
        if (req.user.role !== 'admin' && req.user.id !== volunteerHelp.volunteerId._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to view this help log'
            });
        }

        res.status(200).json({
            success: true,
            data: volunteerHelp
        });
    } catch (error) {
        console.error('Error fetching volunteer help log:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch volunteer help log',
            error: error.message
        });
    }
};

// Sign up for a help ticket (volunteer only)
exports.signUpForHelp = async (req, res) => {
    try {
        const { disasterId } = req.body;
        const volunteerId = req.user.id;
        
        // Check if user is banned
        const user = await User.findById(volunteerId);
        if (user.isBanned) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been banned due to multiple help score deductions',
                banReason: user.banReason,
                bannedAt: user.bannedAt
            });
        }
        
        // Check if volunteer already has an active help ticket for this disaster
        const existingTicket = await VolunteerHelp.findOne({
            volunteerId,
            disasterId,
            status: { $in: ['signed_up', 'pending'] },
            isSignedUp: true
        });
        
        if (existingTicket) {
            return res.status(400).json({
                success: false,
                message: 'You already have an active help ticket for this disaster'
            });
        }
        
        // Create a new help ticket
        const signUpDate = new Date();
        const expirationDate = new Date(signUpDate);
        expirationDate.setDate(expirationDate.getDate() + 3); // 3 days expiration
        
        const helpTicket = new VolunteerHelp({
            volunteerId,
            disasterId,
            location: user.location?.city || 'Not specified',
            description: 'Signed up to help with disaster relief',
            foodPacketsDistributed: 0, // Will be updated when volunteer completes the help
            photos: [], // Will be added when volunteer completes the help
            status: 'signed_up',
            isSignedUp: true,
            signUpDate,
            expirationDate
        });
        
        await helpTicket.save();
        
        res.status(201).json({
            success: true,
            data: helpTicket,
            message: 'Successfully signed up for help. Please complete your help within 3 days.'
        });
    } catch (error) {
        console.error('Error signing up for help:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to sign up for help',
            error: error.message
        });
    }
};

// Get active disasters that need volunteer help
exports.getActiveDisastersForHelp = async (req, res) => {
    try {
        // Run the expiration check
        await checkAndExpireHelpTickets();
        
        // Check if user is banned
        if (req.user.role === 'volunteer') {
            const user = await User.findById(req.user.id);
            if (user.isBanned) {
                return res.status(403).json({
                    success: false,
                    message: 'Your account has been banned due to multiple help score deductions',
                    banReason: user.banReason,
                    bannedAt: user.bannedAt
                });
            }
        }
        
        // Get active disasters from the database
        // This would typically come from the Disaster model
        const Disaster = require('../models/Disaster');
        const activeDisasters = await Disaster.find({ isActive: true }).sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: activeDisasters.length,
            data: activeDisasters
        });
    } catch (error) {
        console.error('Error fetching active disasters for help:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch active disasters',
            error: error.message
        });
    }
};