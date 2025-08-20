const User = require('../models/User');
const Contribution = require('../models/Contribution');
const VolunteerHelp = require('../models/VolunteerHelp');

// Point values for different actions
const POINT_VALUES = {
    CONTRIBUTION: 10,
    VOLUNTEER_HELP: 25,
    DISASTER_REPORT: 15,
    VERIFICATION_BONUS: 5,
    MONTHLY_BONUS: 50
};

// Get user's points and ranking
const getUserPoints = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get user with points
        const user = await User.findById(userId).select('name points role location');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get user's rank
        const usersAbove = await User.countDocuments({ points: { $gt: user.points } });
        const rank = usersAbove + 1;

        // Get total users for percentage calculation
        const totalUsers = await User.countDocuments();

        // Get user's activity stats
        const contributions = await Contribution.countDocuments({ userId });
        const volunteerHelps = await VolunteerHelp.countDocuments({ volunteerId: userId });

        res.json({
            user: {
                id: user._id,
                name: user.name,
                role: user.role,
                location: user.location,
                points: user.points
            },
            rank,
            totalUsers,
            percentile: Math.round(((totalUsers - rank + 1) / totalUsers) * 100),
            activity: {
                contributions,
                volunteerHelps,
                totalActions: contributions + volunteerHelps
            }
        });
    } catch (error) {
        console.error('Get user points error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get leaderboard
const getLeaderboard = async (req, res) => {
    try {
        const { limit = 50, timeframe = 'all' } = req.query;
        
        let matchCondition = {};
        
        // Apply timeframe filter if needed
        if (timeframe !== 'all') {
            const now = new Date();
            let startDate;
            
            switch (timeframe) {
                case 'week':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case 'month':
                    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
                default:
                    startDate = null;
            }
            
            if (startDate) {
                matchCondition.updatedAt = { $gte: startDate };
            }
        }

        // Get top users
        const leaderboard = await User.find(matchCondition)
            .select('name role points location createdAt')
            .sort({ points: -1 })
            .limit(parseInt(limit));

        // Add rank to each user
        const leaderboardWithRank = leaderboard.map((user, index) => ({
            rank: index + 1,
            id: user._id,
            name: user.name,
            role: user.role,
            points: user.points,
            location: user.location,
            joinedAt: user.createdAt
        }));

        res.json({
            leaderboard: leaderboardWithRank,
            timeframe,
            total: leaderboard.length
        });
    } catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Award points to user
const awardPoints = async (userId, action, bonus = 0) => {
    try {
        const pointsToAdd = (POINT_VALUES[action] || 0) + bonus;
        
        if (pointsToAdd > 0) {
            await User.findByIdAndUpdate(
                userId,
                { $inc: { points: pointsToAdd } },
                { new: true }
            );
            
            console.log(`Awarded ${pointsToAdd} points to user ${userId} for ${action}`);
            return pointsToAdd;
        }
        
        return 0;
    } catch (error) {
        console.error('Award points error:', error);
        return 0;
    }
};

// Get user achievements
const getUserAchievements = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get user stats
        const user = await User.findById(userId);
        const contributions = await Contribution.countDocuments({ userId });
        const volunteerHelps = await VolunteerHelp.countDocuments({ volunteerId: userId });
        const verifiedHelps = await VolunteerHelp.countDocuments({ 
            volunteerId: userId, 
            status: 'verified' 
        });

        // Define achievements
        const achievements = [
            {
                id: 'first_contribution',
                name: 'First Contribution',
                description: 'Made your first disaster report',
                icon: 'heart',
                earned: contributions > 0,
                progress: Math.min(contributions, 1),
                target: 1
            },
            {
                id: 'helper',
                name: 'Helper',
                description: 'Completed 5 volunteer help tasks',
                icon: 'hand-helping',
                earned: volunteerHelps >= 5,
                progress: Math.min(volunteerHelps, 5),
                target: 5
            },
            {
                id: 'community_hero',
                name: 'Community Hero',
                description: 'Made 25+ contributions',
                icon: 'shield',
                earned: contributions >= 25,
                progress: Math.min(contributions, 25),
                target: 25
            },
            {
                id: 'expert_volunteer',
                name: 'Expert Volunteer',
                description: 'Completed 20+ volunteer tasks',
                icon: 'star',
                earned: volunteerHelps >= 20,
                progress: Math.min(volunteerHelps, 20),
                target: 20
            },
            {
                id: 'reliable_responder',
                name: 'Reliable Responder',
                description: 'Have 90%+ verification rate',
                icon: 'check-circle',
                earned: volunteerHelps > 0 && (verifiedHelps / volunteerHelps) >= 0.9,
                progress: volunteerHelps > 0 ? Math.round((verifiedHelps / volunteerHelps) * 100) : 0,
                target: 90
            },
            {
                id: 'point_collector',
                name: 'Point Collector',
                description: 'Earned 1000+ points',
                icon: 'trophy',
                earned: user.points >= 1000,
                progress: Math.min(user.points, 1000),
                target: 1000
            }
        ];

        res.json({
            achievements,
            stats: {
                contributions,
                volunteerHelps,
                verifiedHelps,
                points: user.points,
                verificationRate: volunteerHelps > 0 ? Math.round((verifiedHelps / volunteerHelps) * 100) : 0
            }
        });
    } catch (error) {
        console.error('Get achievements error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get points history/activity
const getPointsHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit = 20 } = req.query;

        // Get recent contributions
        const contributions = await Contribution.find({ userId })
            .select('type location createdAt')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit) / 2);

        // Get recent volunteer helps
        const volunteerHelps = await VolunteerHelp.find({ volunteerId: userId })
            .select('disasterId status createdAt')
            .populate('disasterId', 'type location')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit) / 2);

        // Combine and format activities
        const activities = [];

        contributions.forEach(contrib => {
            activities.push({
                type: 'contribution',
                action: 'Disaster Report',
                description: `Reported ${contrib.type} in ${contrib.location?.city || 'Unknown location'}`,
                points: POINT_VALUES.CONTRIBUTION,
                date: contrib.createdAt
            });
        });

        volunteerHelps.forEach(help => {
            activities.push({
                type: 'volunteer_help',
                action: 'Volunteer Help',
                description: `Helped with ${help.disasterId?.type || 'disaster'} response`,
                points: POINT_VALUES.VOLUNTEER_HELP,
                date: help.createdAt,
                status: help.status
            });
        });

        // Sort by date and limit
        activities.sort((a, b) => new Date(b.date) - new Date(a.date));
        const limitedActivities = activities.slice(0, parseInt(limit));

        res.json({
            activities: limitedActivities,
            totalPoints: limitedActivities.reduce((sum, activity) => sum + activity.points, 0)
        });
    } catch (error) {
        console.error('Get points history error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getUserPoints,
    getLeaderboard,
    awardPoints,
    getUserAchievements,
    getPointsHistory,
    POINT_VALUES
};
