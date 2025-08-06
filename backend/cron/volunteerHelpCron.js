const cron = require('node-cron');
const VolunteerHelp = require('../models/VolunteerHelp');
const User = require('../models/User');

// Function to check and expire help tickets
const checkAndExpireHelpTickets = async () => {
    try {
        console.log('Running volunteer help expiration check...');
        const now = new Date();
        
        // Find all signed up help tickets that have expired
        const expiredTickets = await VolunteerHelp.find({
            status: 'signed_up',
            expirationDate: { $lt: now },
            scoreDeducted: false
        });
        
        console.log(`Found ${expiredTickets.length} expired volunteer help tickets`);
        
        // Process each expired ticket
        for (const ticket of expiredTickets) {
            // Update ticket status to expired
            ticket.status = 'expired';
            ticket.scoreDeducted = true;
            await ticket.save();
            
            // Deduct help score from volunteer
            const volunteer = await User.findById(ticket.volunteerId);
            if (volunteer) {
                volunteer.helpScoreDeductions = (volunteer.helpScoreDeductions || 0) + 1;
                
                // Ban user if they have 3 or more deductions
                if (volunteer.helpScoreDeductions >= 3) {
                    volunteer.isBanned = true;
                    volunteer.banReason = 'Accumulated 3 help score deductions for failing to complete volunteer commitments';
                    volunteer.bannedAt = new Date();
                    console.log(`Volunteer ${volunteer._id} has been banned due to 3 help score deductions`);
                }
                
                await volunteer.save();
                console.log(`Deducted help score for volunteer ${volunteer._id}, current deductions: ${volunteer.helpScoreDeductions}`);
            }
        }
        
        console.log('Volunteer help expiration check completed');
    } catch (error) {
        console.error('Error in volunteer help expiration cron job:', error);
    }
};

// Schedule the cron job to run every hour
// This will check for expired tickets and process them
const scheduleVolunteerHelpCron = () => {
    // Run every hour at minute 0
    cron.schedule('0 * * * *', checkAndExpireHelpTickets);
    console.log('Volunteer help expiration cron job scheduled');
    
    // Run once at startup to catch any tickets that expired while the server was down
    checkAndExpireHelpTickets();
};

module.exports = {
    scheduleVolunteerHelpCron,
    checkAndExpireHelpTickets
};