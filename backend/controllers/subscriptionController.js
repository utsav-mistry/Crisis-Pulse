const Subscription = require('../models/Subscription');

// @desc    Subscribe to notifications
// @route   POST /api/subscriptions/subscribe
// @access  Public
exports.subscribe = async (req, res) => {
    const { socketId, location } = req.body;
    const userId = req.user ? req.user.id : null;

    if (!socketId || !location) {
        return res.status(400).json({ message: 'Socket ID and location are required' });
    }

    try {
        let subscription = await Subscription.findOne({ socketId });

        if (subscription) {
            // Update location if already subscribed
            subscription.location = location;
            subscription.userId = userId;
            subscription.isGuest = !userId;
        } else {
            // Create new subscription
            subscription = new Subscription({
                socketId,
                location,
                userId,
                isGuest: !userId
            });
        }

        await subscription.save();
        res.status(201).json(subscription);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Unsubscribe from notifications
// @route   POST /api/subscriptions/unsubscribe
// @access  Public
exports.unsubscribe = async (req, res) => {
    const { socketId } = req.body;

    if (!socketId) {
        return res.status(400).json({ message: 'Socket ID is required' });
    }

    try {
        await Subscription.findOneAndDelete({ socketId });
        res.status(200).json({ message: 'Unsubscribed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all subscriptions
// @route   GET /api/subscriptions
// @access  Admin
exports.getSubscriptions = async (req, res) => {
    try {
        const subscriptions = await Subscription.find().populate('userId', 'name email');
        res.status(200).json(subscriptions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
