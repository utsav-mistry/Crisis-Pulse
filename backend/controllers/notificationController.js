const Notification = require('../models/Notification');
const TestLog = require('../models/TestLog');
const User = require('../models/User');

// Create a new notification
const createNotification = async (req, res) => {
    try {
        const { type, location, severity, message, advice } = req.body;
        const notification = new Notification({ type, location, severity, message, advice });
        await notification.save();
        res.status(201).json(notification);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all notifications
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find();
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get notification by ID
const getNotificationById = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) return res.status(404).json({ message: 'Notification not found' });
        res.json(notification);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update notification
const updateNotification = async (req, res) => {
    try {
        const { type, location, severity, message, advice } = req.body;
        const updateData = { type, location, severity, message, advice };
        const notification = await Notification.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!notification) return res.status(404).json({ message: 'Notification not found' });
        res.json(notification);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete notification
const deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndDelete(req.params.id);
        if (!notification) return res.status(404).json({ message: 'Notification not found' });
        res.json({ message: 'Notification deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get latest notifications for public subscribers (no auth required)
const getLatestPublicNotifications = async (req, res) => {
    try {
        // Get the 5 most recent notifications
        const notifications = await Notification.find()
            .sort({ createdAt: -1 })
            .limit(5);
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get notifications for the logged-in user
const getUserNotifications = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const notifications = await Notification.find({
            $or: [
                { recipient: req.user.id },
                { recipient: user.role } // e.g., 'admin'
            ]
        }).sort({ createdAt: -1 });
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Mark a notification as read
const markNotificationAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        // Basic check to ensure users can only mark their own notifications
        // Note: This check is simplified. A more robust check would be needed for production.
        if (notification.recipient !== req.user.id && notification.recipient !== 'admin') {
             return res.status(403).json({ message: 'Not authorized' });
        }
        notification.read = true;
        await notification.save();
        res.json(notification);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Mark all notifications as read
const markAllNotificationsAsRead = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        await Notification.updateMany(
            { $or: [{ recipient: req.user.id }, { recipient: user.role }], read: false },
            { $set: { read: true } }
        );
        res.json({ message: 'All notifications marked as read' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Broadcast notification to all users including non-logged in subscribers
const broadcastNotification = async (req, res) => {
    const { type, location, severity, message, advice, test } = req.body;

    try {
        if (test) {
            await new TestLog({
                admin: req.user.id,
                action: 'send_notification',
                details: req.body
            }).save();
        }

        const notification = new Notification({
            recipient: 'all', // For broadcast
            type,
            location,
            severity,
            message: (test ? '[TEST] ' : '') + message,
            advice
        });
        await notification.save();
        
        const io = req.app.get('io');
        
        const payload = {
            id: notification._id,
            type: notification.type,
            location: notification.location,
            severity: notification.severity,
            message: notification.message,
            timestamp: notification.createdAt
        };

        io.emit('new_disaster_alert', payload);
        io.to('public_notifications').emit('new_disaster_alert', payload);
        
        res.status(201).json(notification);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    createNotification,
    getNotifications,
    getNotificationById,
    updateNotification,
    deleteNotification,
    getLatestPublicNotifications,
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    broadcastNotification
};