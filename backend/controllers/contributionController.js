const Contribution = require('../models/Contribution');
const { awardPoints, POINT_VALUES } = require('./pointsController');

// Create a new contribution
const createContribution = async (req, res) => {
    try {
        const userId = req.user._id;
        const { disasterId, item, quantity, category, deliveryMethod, contactInfo } = req.body;
        
        const contribution = new Contribution({ 
            userId, 
            disasterId, 
            item, 
            quantity, 
            category,
            deliveryMethod,
            contactInfo
        });
        await contribution.save();
        
        // Award points for contribution
        const pointsAwarded = await awardPoints(userId, 'CONTRIBUTION');
        
        res.status(201).json({
            ...contribution.toObject(),
            pointsAwarded
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get user contributions
const getUserContributions = async (req, res) => {
    try {
        const { userId } = req.params;
        const contributions = await Contribution.find({ userId })
            .populate('disasterId', 'title type location severity')
            .sort({ createdAt: -1 });
        res.json(contributions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all contributions
const getContributions = async (req, res) => {
    try {
        const contributions = await Contribution.find().populate('userId', 'name email').populate('disasterId', 'type location');
        res.json(contributions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get contribution by ID
const getContributionById = async (req, res) => {
    try {
        const contribution = await Contribution.findById(req.params.id).populate('userId', 'name email').populate('disasterId', 'type location');
        if (!contribution) return res.status(404).json({ message: 'Contribution not found' });
        res.json(contribution);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update contribution
const updateContribution = async (req, res) => {
    try {
        const contribution = await Contribution.findById(req.params.id);

        if (!contribution) {
            return res.status(404).json({ message: 'Contribution not found' });
        }

        // Check if the user is the owner or an admin/crpf
        if (contribution.userId.toString() !== req.user.id && !['admin', 'crpf'].includes(req.user.role)) {
            return res.status(403).json({ message: 'User not authorized to update this contribution' });
        }

        const { userId, disasterId, item, quantity, pointsEarned } = req.body;
        const updateData = { userId, disasterId, item, quantity, pointsEarned };
        const updatedContribution = await Contribution.findByIdAndUpdate(req.params.id, updateData, { new: true });
        
        res.json(updatedContribution);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete contribution
const deleteContribution = async (req, res) => {
    try {
        const contribution = await Contribution.findById(req.params.id);

        if (!contribution) {
            return res.status(404).json({ message: 'Contribution not found' });
        }

        // Check if the user is the owner or an admin/crpf
        if (contribution.userId.toString() !== req.user.id && !['admin', 'crpf'].includes(req.user.role)) {
            return res.status(403).json({ message: 'User not authorized to delete this contribution' });
        }

        await Contribution.findByIdAndDelete(req.params.id);
        
        res.json({ message: 'Contribution deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    createContribution,
    getUserContributions,
    getContributions,
    getContributionById,
    updateContribution,
    deleteContribution,
}; 