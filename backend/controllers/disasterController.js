const Disaster = require('../models/Disaster');
const CrpfNotification = require('../models/CrpfNotification');
const Notification = require('../models/Notification');

// Create a new disaster
exports.createDisaster = async (req, res) => {
    try {
        const { type, location, severity, source, predictionDate, raisedBy, message } = req.body;
        const disaster = new Disaster({ type, location, severity, source, predictionDate, raisedBy });
        await disaster.save();
        
        // Create notification for the disaster
        const notification = new Notification({
            type,
            location,
            severity,
            message: message || `${severity} ${type} disaster in ${location.city}, ${location.state}`,
            advice: getAdviceForDisaster(type, severity)
        });
        await notification.save();
        
        // If severity is high, create a CRPF notification entry
        if (severity === 'high') {
            const crpfNotification = new CrpfNotification({
                disasterId: disaster._id,
                notifiedBy: raisedBy
            });
            await crpfNotification.save();
            
            // Get the socket.io instance from the app
            const io = req.app.get('io');
            
            // Broadcast to admin users
            io.to('role_admin').emit('extreme_disaster_alert', {
                id: disaster._id,
                type,
                location,
                severity,
                message: message || `EXTREME ALERT: ${type} disaster in ${location.city}, ${location.state}`,
                crpfNotificationId: crpfNotification._id,
                timestamp: new Date()
            });
        }
        
        // Broadcast the disaster alert using the global function
        if (global.broadcastDisasterAlert) {
            global.broadcastDisasterAlert({
                type,
                location,
                severity,
                message: message || `${severity} ${type} disaster in ${location.city}, ${location.state}`
            });
        }
        
        res.status(201).json(disaster);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Helper function to get advice based on disaster type and severity
const getAdviceForDisaster = (type, severity) => {
    const adviceMap = {
        flood: {
            low: 'Stay informed about water levels. Avoid flood-prone areas.',
            medium: 'Move to higher ground. Prepare emergency supplies.',
            high: 'Evacuate immediately if instructed. Do not walk or drive through floodwaters.'
        },
        earthquake: {
            low: 'No immediate action needed. Check for updates.',
            medium: 'Drop, cover, and hold on. Stay away from windows.',
            high: 'Drop, cover, and hold on. Expect aftershocks. Check for injuries and damage.'
        },
        cyclone: {
            low: 'Monitor weather updates. Secure loose items outdoors.',
            medium: 'Stay indoors. Keep emergency supplies ready.',
            high: 'Seek shelter immediately. Stay away from windows and doors.'
        },
        drought: {
            low: 'Conserve water. Follow local water restrictions.',
            medium: 'Implement water conservation measures. Check on vulnerable people.',
            high: 'Strictly follow water rationing. Check on elderly and vulnerable.'
        },
        wildfire: {
            low: 'Be prepared to evacuate. Keep informed of fire movement.',
            medium: 'Pack essentials. Be ready to evacuate at short notice.',
            high: 'Evacuate immediately if instructed. Follow evacuation routes.'
        },
        landslide: {
            low: 'Monitor local warnings. Avoid steep slopes during heavy rain.',
            medium: 'Prepare to evacuate. Watch for signs like tilting trees or new cracks in ground.',
            high: 'Evacuate immediately. Do not return until authorities declare it safe.'
        },
        tsunami: {
            low: 'Stay informed. Move away from beaches and low-lying areas.',
            medium: 'Move to higher ground immediately. Follow evacuation routes.',
            high: 'Move inland or to higher ground immediately. Do not wait for official warnings.'
        },
        heatwave: {
            low: 'Stay hydrated. Avoid strenuous activities during peak heat.',
            medium: 'Stay in air-conditioned areas. Check on vulnerable people.',
            high: 'Avoid outdoor activities. Check on elderly and vulnerable frequently.'
        }
    };
    
    return adviceMap[type]?.[severity] || 'Stay alert and follow official instructions.';
};

// Get all disasters
exports.getDisasters = async (req, res) => {
    try {
        const disasters = await Disaster.find().populate('raisedBy', 'name email');
        res.json(disasters);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get disaster by ID
exports.getDisasterById = async (req, res) => {
    try {
        const disaster = await Disaster.findById(req.params.id).populate('raisedBy', 'name email');
        if (!disaster) return res.status(404).json({ message: 'Disaster not found' });
        res.json(disaster);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update disaster
exports.updateDisaster = async (req, res) => {
    try {
        const { type, location, severity, source, predictionDate, raisedBy } = req.body;
        const updateData = { type, location, severity, source, predictionDate, raisedBy };
        const disaster = await Disaster.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!disaster) return res.status(404).json({ message: 'Disaster not found' });
        res.json(disaster);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete disaster
exports.deleteDisaster = async (req, res) => {
    try {
        const disaster = await Disaster.findByIdAndDelete(req.params.id);
        if (!disaster) return res.status(404).json({ message: 'Disaster not found' });
        res.json({ message: 'Disaster deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
