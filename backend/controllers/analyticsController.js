const Disaster = require('../models/Disaster');
const User = require('../models/User');
const Contribution = require('../models/Contribution');
const VolunteerTask = require('../models/VolunteerTask');
const AIInsight = require('../models/AIInsight');

// @desc    Get system-wide analytics
// @route   GET /api/analytics
// @access  Private/Admin
const getAnalytics = async (req, res) => {
    try {
        // Disaster analytics
        const disasterTypes = await Disaster.aggregate([
            { $group: { _id: '$type', count: { $sum: 1 } } },
            { $project: { name: '$_id', count: 1, _id: 0 } }
        ]);

        // Volunteer analytics (monthly registration)
        const volunteerActivity = await User.aggregate([
            { $match: { role: 'volunteer' } },
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } },
            { $project: { month: '$_id', count: 1, _id: 0 } }
        ]);

        // Contribution trends (monthly)
        const contributionTrends = await Contribution.aggregate([
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    total: { $sum: '$quantity' } // Assuming quantity is a field
                }
            },
            { $sort: { _id: 1 } },
            { $project: { month: '$_id', total: 1, _id: 0 } }
        ]);
        
        // Task completion rates
        const totalTasks = await VolunteerTask.countDocuments();
        const completedTasks = await VolunteerTask.countDocuments({ status: 'verified' });

        res.json({
            disasterTypes,
            volunteerActivity,
            contributionTrends,
            taskCompletion: {
                total: totalTasks,
                completed: completedTasks,
                rate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};


// @desc    Get live AI insights from console logs
// @route   GET /api/analytics/insights
// @access  Private/Admin
const getAiInsights = async (req, res) => {
    try {
        const insights = await AIInsight.find().sort({ timestamp: -1 }).limit(50);
        res.json({
            insights,
            lastUpdated: new Date(),
            count: insights.length
        });
    } catch (error) {
        console.error('Error fetching AI insights:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add AI insight data (called internally)
// @route   POST /api/analytics/insights
// @access  Internal
const addAiInsight = async (insightData) => {
    try {
        const insight = new AIInsight(insightData);
        await insight.save();

        // Optional: Clean up old insights to prevent the collection from growing indefinitely
        const count = await AIInsight.countDocuments();
        if (count > 1000) { // Keep the latest 1000 insights
            const oldestInsights = await AIInsight.find().sort({ timestamp: 1 }).limit(count - 1000);
            const idsToDelete = oldestInsights.map(doc => doc._id);
            await AIInsight.deleteMany({ _id: { $in: idsToDelete } });
        }
    } catch (error) {
        console.error('Error adding AI insight:', error);
    }
};

module.exports = { getAnalytics, getAiInsights, addAiInsight };
