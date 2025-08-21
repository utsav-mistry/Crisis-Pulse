const VolunteerTask = require('../models/VolunteerTask');
const User = require('../models/User');
const Disaster = require('../models/Disaster');
const { sendNotification } = require('../utils/notificationUtils');

// @desc    Get all open volunteer tasks
// @route   GET /api/volunteer-tasks
// @access  Private (Volunteer)
exports.getOpenTasks = async (req, res) => {
    try {
        const tasks = await VolunteerTask.find({ status: 'open' }).populate('disaster', 'title type location severity');
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get tasks claimed by the logged-in volunteer
// @route   GET /api/volunteer-tasks/my-tasks
// @access  Private (Volunteer)
exports.getMyTasks = async (req, res) => {
    try {
        const tasks = await VolunteerTask.find({ volunteer: req.user.id }).populate('disaster', 'title type location severity');
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Claim a volunteer task
// @route   POST /api/volunteer-tasks/:id/claim
// @access  Private (Volunteer)
exports.claimTask = async (req, res) => {
    try {
        const task = await VolunteerTask.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if (task.status !== 'open') {
            return res.status(400).json({ message: 'Task is not available' });
        }

        task.volunteer = req.user.id;
        task.status = 'claimed';
        task.claimedAt = Date.now();
        task.deadline = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

        await task.save();

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Submit proof for a volunteer task
// @route   POST /api/volunteer-tasks/:id/submit
// @access  Private (Volunteer)
exports.submitTask = async (req, res) => {
    try {
        const { proof } = req.body;
        const task = await VolunteerTask.findById(req.params.id);

        if (!task || task.volunteer.toString() !== req.user.id) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if (task.status !== 'claimed') {
            return res.status(400).json({ message: 'Task not ready for submission' });
        }

        if (new Date() > task.deadline) {
            task.status = 'expired';
            await task.save();
            // Logic to deduct points will be handled by a cron job
            return res.status(400).json({ message: 'Deadline has passed' });
        }

        task.proof = proof;
        task.status = 'submitted';
        await task.save();

        // Notify admins
        const volunteer = await User.findById(req.user.id);
        const message = `New volunteer task "${task.description}" submitted by ${volunteer.name} is awaiting verification.`;
        sendNotification(req.app.get('io'), 'admin', 'task_submitted', message, { taskId: task._id }, `/admin/verify-tasks/${task._id}`);

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all tasks for admin verification
// @route   GET /api/admin/volunteer-tasks
// @access  Private (Admin)
exports.getTasksForVerification = async (req, res) => {
    try {
        const tasks = await VolunteerTask.find({ status: 'submitted' })
            .populate('disaster', 'title type location')
            .populate('volunteer', 'name email');
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Verify a volunteer task
// @route   POST /api/admin/volunteer-tasks/:id/verify
// @access  Private (Admin)
exports.verifyTask = async (req, res) => {
    try {
        const { approved, adminFeedback } = req.body;
        const task = await VolunteerTask.findById(req.params.id);

        if (!task || task.status !== 'submitted') {
            return res.status(404).json({ message: 'Task not found or not ready for verification' });
        }

        if (approved) {
            task.status = 'approved';
            // Award points
            const volunteer = await User.findById(task.volunteer);
            volunteer.points += 25; // Example points
            await volunteer.save();
        } else {
            task.status = 'rejected';
        }

        task.adminFeedback = adminFeedback;
        await task.save();

        // Notify the volunteer
        const status = approved ? 'approved' : 'rejected';
        const message = `Your task submission "${task.description}" has been ${status}.`;
        sendNotification(req.app.get('io'), task.volunteer.toString(), `task_${status}`, message, { taskId: task._id, feedback: adminFeedback }, `/volunteer/my-tasks`);

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
