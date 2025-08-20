const User = require('../models/User');
const Disaster = require('../models/Disaster');
const Contribution = require('../models/Contribution');
const VolunteerHelp = require('../models/VolunteerHelp');

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
    try {
        // Get counts for different entities
        const [
            totalUsers,
            totalVolunteers,
            activeDisasters,
            totalContributions,
            totalVolunteerHelps,
            recentDisasters
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: 'volunteer' }),
            Disaster.countDocuments({ status: { $in: ['active', 'ongoing'] } }),
            Contribution.countDocuments(),
            VolunteerHelp.countDocuments(),
            Disaster.find({ status: { $in: ['active', 'ongoing'] } })
                .sort({ createdAt: -1 })
                .limit(5)
        ]);

        // Calculate average response time (mock calculation)
        const avgResponseTime = '2.3min';

        // Get AI predictions count (mock for now)
        const predictions = Math.floor(Math.random() * 20) + 5;

        const stats = {
            activeDisasters,
            predictions,
            contributions: totalContributions,
            alerts: activeDisasters + Math.floor(Math.random() * 5),
            volunteers: totalVolunteers,
            users: totalUsers,
            responseTime: avgResponseTime,
            recentDisasters
        };

        res.json(stats);
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ 
            message: 'Failed to fetch dashboard statistics',
            error: error.message 
        });
    }
};

// Get recent disasters for dashboard
const getRecentDisasters = async (req, res) => {
    try {
        const disasters = await Disaster.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('reportedBy', 'name')
            .lean();

        const formattedDisasters = disasters.map(disaster => ({
            id: disaster._id,
            type: disaster.type,
            severity: disaster.severity,
            location: disaster.location.address || `${disaster.location.city}, ${disaster.location.state}`,
            status: disaster.status,
            time: getTimeAgo(disaster.createdAt),
            reportedBy: disaster.reportedBy?.name || 'Anonymous'
        }));

        res.json(formattedDisasters);
    } catch (error) {
        console.error('Error fetching recent disasters:', error);
        res.status(500).json({ 
            message: 'Failed to fetch recent disasters',
            error: error.message 
        });
    }
};

// Helper function to format time ago
const getTimeAgo = (date) => {
    const now = new Date();
    const diffInMs = now - new Date(date);
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
        return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else if (diffInHours > 0) {
        return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }
};

module.exports = {
    getDashboardStats,
    getRecentDisasters
};
