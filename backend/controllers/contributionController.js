const Contribution = require('../models/Contribution');

// Create a new contribution
exports.createContribution = async (req, res) => {
    try {
        const { userId, disasterId, item, quantity, pointsEarned } = req.body;
        const contribution = new Contribution({ userId, disasterId, item, quantity, pointsEarned });
        await contribution.save();
        res.status(201).json(contribution);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all contributions
exports.getContributions = async (req, res) => {
    try {
        const contributions = await Contribution.find().populate('userId', 'name email').populate('disasterId', 'type location');
        res.json(contributions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get contribution by ID
exports.getContributionById = async (req, res) => {
    try {
        const contribution = await Contribution.findById(req.params.id).populate('userId', 'name email').populate('disasterId', 'type location');
        if (!contribution) return res.status(404).json({ message: 'Contribution not found' });
        res.json(contribution);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update contribution
exports.updateContribution = async (req, res) => {
    try {
        const { userId, disasterId, item, quantity, pointsEarned } = req.body;
        const updateData = { userId, disasterId, item, quantity, pointsEarned };
        const contribution = await Contribution.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!contribution) return res.status(404).json({ message: 'Contribution not found' });
        res.json(contribution);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete contribution
exports.deleteContribution = async (req, res) => {
    try {
        const contribution = await Contribution.findByIdAndDelete(req.params.id);
        if (!contribution) return res.status(404).json({ message: 'Contribution not found' });
        res.json({ message: 'Contribution deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}; 