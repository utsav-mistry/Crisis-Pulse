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