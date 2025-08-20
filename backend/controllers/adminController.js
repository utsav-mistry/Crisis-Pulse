const User = require('../models/User');
const Notification = require('../models/Notification');

// Get all users with filtering and pagination
const getAllUsers = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            role, 
            status, 
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const filter = {};
        
        // Role filter
        if (role && role !== 'all') {
            filter.role = role;
        }
        
        // Status filter for volunteers
        if (status && status !== 'all' && role === 'volunteer') {
            filter.volunteerStatus = status;
        }
        
        // Search filter
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const users = await User.find(filter)
            .select('-password')
            .populate('approvedBy', 'name email')
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await User.countDocuments(filter);

        res.json({
            users,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Approve volunteer
const approveVolunteer = async (req, res) => {
    try {
        const { userId } = req.params;
        const adminId = req.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role !== 'volunteer') {
            return res.status(400).json({ message: 'User is not a volunteer' });
        }

        if (user.volunteerStatus === 'approved') {
            return res.status(400).json({ message: 'Volunteer is already approved' });
        }

        user.volunteerStatus = 'approved';
        user.approvedBy = adminId;
        user.approvedAt = new Date();
        user.rejectionReason = undefined;

        await user.save();

        // Create notification for the volunteer
        const notification = new Notification({
            userId: user._id,
            type: 'volunteer_approved',
            title: 'Volunteer Application Approved',
            message: 'Congratulations! Your volunteer application has been approved. You can now participate in disaster response activities.',
            priority: 'high'
        });
        await notification.save();

        // Emit socket event if available
        const io = req.app.get('io');
        if (io) {
            io.to(`user_${user._id}`).emit('volunteer_status_update', {
                status: 'approved',
                message: 'Your volunteer application has been approved!'
            });
        }

        res.json({ 
            message: 'Volunteer approved successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                volunteerStatus: user.volunteerStatus,
                approvedAt: user.approvedAt
            }
        });
    } catch (error) {
        console.error('Error approving volunteer:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Reject volunteer
const rejectVolunteer = async (req, res) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body;
        const adminId = req.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role !== 'volunteer') {
            return res.status(400).json({ message: 'User is not a volunteer' });
        }

        user.volunteerStatus = 'rejected';
        user.rejectionReason = reason || 'Application rejected by admin';
        user.approvedBy = adminId;
        user.approvedAt = new Date();

        await user.save();

        // Create notification for the volunteer
        const notification = new Notification({
            userId: user._id,
            type: 'volunteer_rejected',
            title: 'Volunteer Application Rejected',
            message: `Your volunteer application has been rejected. Reason: ${user.rejectionReason}`,
            priority: 'medium'
        });
        await notification.save();

        // Emit socket event if available
        const io = req.app.get('io');
        if (io) {
            io.to(`user_${user._id}`).emit('volunteer_status_update', {
                status: 'rejected',
                message: `Your volunteer application has been rejected. ${user.rejectionReason}`
            });
        }

        res.json({ 
            message: 'Volunteer rejected successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                volunteerStatus: user.volunteerStatus,
                rejectionReason: user.rejectionReason
            }
        });
    } catch (error) {
        console.error('Error rejecting volunteer:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Suspend volunteer
const suspendVolunteer = async (req, res) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body;
        const adminId = req.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role !== 'volunteer') {
            return res.status(400).json({ message: 'User is not a volunteer' });
        }

        user.volunteerStatus = 'suspended';
        user.rejectionReason = reason || 'Volunteer suspended by admin';
        user.approvedBy = adminId;
        user.approvedAt = new Date();

        await user.save();

        // Create notification for the volunteer
        const notification = new Notification({
            userId: user._id,
            type: 'volunteer_suspended',
            title: 'Volunteer Account Suspended',
            message: `Your volunteer account has been suspended. Reason: ${user.rejectionReason}`,
            priority: 'high'
        });
        await notification.save();

        // Emit socket event if available
        const io = req.app.get('io');
        if (io) {
            io.to(`user_${user._id}`).emit('volunteer_status_update', {
                status: 'suspended',
                message: `Your volunteer account has been suspended. ${user.rejectionReason}`
            });
        }

        res.json({ 
            message: 'Volunteer suspended successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                volunteerStatus: user.volunteerStatus,
                rejectionReason: user.rejectionReason
            }
        });
    } catch (error) {
        console.error('Error suspending volunteer:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get volunteer statistics
const getVolunteerStats = async (req, res) => {
    try {
        const stats = await User.aggregate([
            { $match: { role: 'volunteer' } },
            {
                $group: {
                    _id: '$volunteerStatus',
                    count: { $sum: 1 }
                }
            }
        ]);

        const formattedStats = {
            pending: 0,
            approved: 0,
            rejected: 0,
            suspended: 0,
            total: 0
        };

        stats.forEach(stat => {
            if (stat._id) {
                formattedStats[stat._id] = stat.count;
                formattedStats.total += stat.count;
            }
        });

        res.json(formattedStats);
    } catch (error) {
        console.error('Error fetching volunteer stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create admin user
const createAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(password, 12);

        const admin = new User({
            name,
            email,
            password: hashedPassword,
            role: 'admin',
            isActive: true
        });

        await admin.save();

        res.status(201).json({
            message: 'Admin created successfully',
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            }
        });
    } catch (error) {
        console.error('Error creating admin:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Ban/Unban user
const toggleUserBan = async (req, res) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role === 'admin') {
            return res.status(400).json({ message: 'Cannot ban admin users' });
        }

        user.isActive = !user.isActive;
        if (!user.isActive) {
            user.rejectionReason = reason || 'User banned by admin';
        } else {
            user.rejectionReason = undefined;
        }

        await user.save();

        // Create notification
        const notification = new Notification({
            userId: user._id,
            type: user.isActive ? 'account_unbanned' : 'account_banned',
            title: user.isActive ? 'Account Unbanned' : 'Account Banned',
            message: user.isActive ? 
                'Your account has been unbanned. You can now access the platform.' :
                `Your account has been banned. Reason: ${user.rejectionReason}`,
            priority: 'high'
        });
        await notification.save();

        res.json({
            message: `User ${user.isActive ? 'unbanned' : 'banned'} successfully`,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isActive: user.isActive,
                rejectionReason: user.rejectionReason
            }
        });
    } catch (error) {
        console.error('Error toggling user ban:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAllUsers,
    approveVolunteer,
    rejectVolunteer,
    suspendVolunteer,
    getVolunteerStats,
    createAdmin,
    toggleUserBan
};
