const CrpfNotification = require('../models/CrpfNotification');
const Disaster = require('../models/Disaster');

// Get all CRPF notifications
exports.getCrpfNotifications = async (req, res) => {
    try {
        const notifications = await CrpfNotification.find()
            .populate('disasterId')
            .populate('notifiedBy', 'name email');
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get CRPF notification by ID
exports.getCrpfNotificationById = async (req, res) => {
    try {
        const notification = await CrpfNotification.findById(req.params.id)
            .populate('disasterId')
            .populate('notifiedBy', 'name email');
        if (!notification) return res.status(404).json({ message: 'CRPF notification not found' });
        res.json(notification);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update CRPF notification status
exports.updateCrpfNotificationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        if (status !== 'notified') {
            return res.status(400).json({ message: 'Invalid status' });
        }
        
        const notification = await CrpfNotification.findById(req.params.id);
        if (!notification) return res.status(404).json({ message: 'CRPF notification not found' });
        
        notification.status = status;
        notification.notifiedAt = new Date();
        await notification.save();
        
        res.json(notification);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get pending CRPF notifications
exports.getPendingCrpfNotifications = async (req, res) => {
    try {
        const notifications = await CrpfNotification.find({ status: 'pending' })
            .populate('disasterId')
            .populate('notifiedBy', 'name email');
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};