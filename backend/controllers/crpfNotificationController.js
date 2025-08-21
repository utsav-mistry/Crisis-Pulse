const CrpfNotification = require('../models/CrpfNotification');
const Disaster = require('../models/Disaster');

// Get all CRPF notifications
const getCrpfNotifications = async (req, res) => {
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
const getCrpfNotificationById = async (req, res) => {
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
const updateCrpfNotificationStatus = async (req, res) => {
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
const getPendingCrpfNotifications = async (req, res) => {
    try {
        const notifications = await CrpfNotification.find({ status: 'pending' })
            .populate('disasterId')
            .populate('notifiedBy', 'name email');
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create manual CRPF notification
const createManualCrpfNotification = async (req, res) => {
    try {
        const { title, message, priority } = req.body;
        
        if (!title || !message) {
            return res.status(400).json({ message: 'Title and message are required' });
        }

        const crpfNotification = new CrpfNotification({
            disasterId: null, // Manual notification doesn't need disaster reference
            notifiedBy: req.user._id,
            status: 'pending',
            message: message,
            title: title,
            priority: priority || 'medium',
            crpfUnits: [
                'CRPF Battalion 123 - Delhi',
                'CRPF Battalion 456 - Mumbai',
                'Emergency Response Team Alpha'
            ]
        });

        await crpfNotification.save();
        
        const populatedNotification = await CrpfNotification.findById(crpfNotification._id)
            .populate('notifiedBy', 'name email');

        // Broadcast the notification via sockets
        if (global.broadcastCrpfNotification) {
            global.broadcastCrpfNotification(populatedNotification);
        }

        res.status(201).json(populatedNotification);
    } catch (error) {
        console.error('Error creating manual CRPF notification:', error);
        res.status(500).json({ message: error.message });
    }
};

// Create dummy CRPF notification for high-severity disasters
const createCrpfNotification = async (disasterId, notifiedBy) => {
    try {
        const disaster = await Disaster.findById(disasterId);
        if (!disaster) return null;

        // Only create CRPF notification for high severity disasters
        if (disaster.severity !== 'high') return null;

        const crpfNotification = new CrpfNotification({
            disasterId: disasterId,
            notifiedBy: notifiedBy,
            status: 'pending',
            message: `High severity ${disaster.type} detected in ${disaster.location.city}, ${disaster.location.state}. CRPF teams have been automatically alerted.`,
            priority: 'high',
            crpfUnits: [
                'CRPF Battalion 123 - Delhi',
                'CRPF Battalion 456 - Mumbai',
                'Emergency Response Team Alpha'
            ]
        });

        await crpfNotification.save();

        // Simulate CRPF notification process
        setTimeout(async () => {
            crpfNotification.status = 'notified';
            crpfNotification.notifiedAt = new Date();
            await crpfNotification.save();
        }, 2000); // 2 second delay to simulate notification process

        return crpfNotification;
    } catch (error) {
        console.error('Error creating CRPF notification:', error);
        return null;
    }
};

module.exports = {
    getCrpfNotifications,
    getCrpfNotificationById,
    updateCrpfNotificationStatus,
    getPendingCrpfNotifications,
    createManualCrpfNotification,
    createCrpfNotification
};