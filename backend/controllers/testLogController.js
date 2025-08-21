const TestLog = require('../models/TestLog');

// Get all test logs with pagination
exports.getTestLogs = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const logs = await TestLog.find()
            .populate('admin', 'name email')
            .sort({ timestamp: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await TestLog.countDocuments();

        res.json({
            logs,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error('Error fetching test logs:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
