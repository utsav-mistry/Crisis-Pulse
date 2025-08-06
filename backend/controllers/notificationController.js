const Notification = require('../models/Notification');

// Create a new notification
exports.createNotification = async (req, res) => {
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
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find();
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get notification by ID
exports.getNotificationById = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) return res.status(404).json({ message: 'Notification not found' });
        res.json(notification);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update notification
exports.updateNotification = async (req, res) => {
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
exports.deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndDelete(req.params.id);
        if (!notification) return res.status(404).json({ message: 'Notification not found' });
        res.json({ message: 'Notification deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get latest notifications for public subscribers (no auth required)
exports.getLatestPublicNotifications = async (req, res) => {
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

// Broadcast notification to all users including non-logged in subscribers
exports.broadcastNotification = async (req, res) => {
    try {
        const { type, location, severity, message, advice } = req.body;
        const notification = new Notification({ type, location, severity, message, advice });
        await notification.save();
        
        // Get the socket.io instance from the app
        const io = req.app.get('io');
        
        // Broadcast to all connected clients
        io.emit('new_disaster_alert', {
            id: notification._id,
            type: notification.type,
            location: notification.location,
            severity: notification.severity,
            message: notification.message,
            timestamp: notification.createdAt
        });
        
        // Also send to public notifications room
        io.to('public_notifications').emit('new_disaster_alert', {
            id: notification._id,
            type: notification.type,
            location: notification.location,
            severity: notification.severity,
            message: notification.message,
            timestamp: notification.createdAt
        });
        
        res.status(201).json(notification);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};