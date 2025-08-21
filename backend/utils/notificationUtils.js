const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Sends a notification to a specific user or a group of users.
 *
 * @param {object} io - The Socket.IO instance.
 * @param {string} recipientId - The ID of the recipient user. Can be a specific user ID or a role (e.g., 'admin').
 * @param {string} type - The type of notification (e.g., 'task_submitted', 'task_verified').
 * @param {string} message - The notification message.
 * @param {object} [data={}] - Additional data to include with the notification.
 */
const sendNotification = async (io, recipientId, type, message, data = {}, link = null) => {
    try {
        const notification = new Notification({
            recipient: recipientId, // This can be a user ID or a role string
            type,
            message,
            data,
            link
        });
        await notification.save();

        const payload = {
            _id: notification._id,
            type: notification.type,
            message: notification.message,
            data: notification.data,
            link: notification.link,
            createdAt: notification.createdAt,
            read: false
        };

        if (recipientId === 'admin') {
            // Find all admin users and emit to their sockets
            const admins = await User.find({ role: 'admin' });
            admins.forEach(admin => {
                // Emitting to a room named after the user's ID
                io.to(admin._id.toString()).emit('new_notification', payload);
            });
        } else {
            // Emitting to a room named after the user's ID
            io.to(recipientId).emit('new_notification', payload);
        }

    } catch (error) {
        console.error('Error sending notification:', error);
    }
};

module.exports = { sendNotification };
