const Disaster = require('../models/Disaster');

// Create a new disaster
exports.createDisaster = async (req, res) => {
    try {
        const { type, location, severity, source, predictionDate, raisedBy } = req.body;
        const disaster = new Disaster({ type, location, severity, source, predictionDate, raisedBy });
        await disaster.save();
        res.status(201).json(disaster);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
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
