const Disaster = require('../models/Disaster');
const Notification = require('../models/Notification');
const User = require('../models/User');

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // Join location-based room
        socket.on('join_location', (location) => {
            socket.join(`location_${location.city}_${location.state}`);
            console.log(`User joined location: ${location.city}, ${location.state}`);
        });

        // Join user-specific room
        socket.on('join_user', (userId) => {
            socket.join(`user_${userId}`);
            console.log(`User joined personal room: ${userId}`);
        });

        // Handle disaster alerts
        socket.on('disaster_alert', async (data) => {
            try {
                // Create notification
                const notification = new Notification({
                    type: data.type,
                    location: data.location,
                    severity: data.severity,
                    message: data.message,
                    broadcastTo: 'all'
                });
                await notification.save();

                // Broadcast to all users
                io.emit('new_disaster_alert', {
                    id: notification._id,
                    type: data.type,
                    location: data.location,
                    severity: data.severity,
                    message: data.message,
                    timestamp: new Date()
                });

                // Send to specific location
                io.to(`location_${data.location.city}_${data.location.state}`).emit('local_disaster_alert', {
                    id: notification._id,
                    type: data.type,
                    location: data.location,
                    severity: data.severity,
                    message: data.message,
                    timestamp: new Date()
                });

            } catch (error) {
                console.error('Error broadcasting disaster alert:', error);
            }
        });

        // Handle contribution updates
        socket.on('contribution_update', async (data) => {
            try {
                // Update user points
                const user = await User.findById(data.userId);
                if (user) {
                    user.points += data.pointsEarned;
                    await user.save();

                    // Notify user about points update
                    io.to(`user_${data.userId}`).emit('points_updated', {
                        newPoints: user.points,
                        pointsEarned: data.pointsEarned
                    });
                }
            } catch (error) {
                console.error('Error updating contribution:', error);
            }
        });

        // Handle user status updates
        socket.on('user_status_update', (data) => {
            io.emit('user_status_changed', {
                userId: data.userId,
                status: data.status,
                location: data.location
            });
        });

        // Handle emergency broadcasts
        socket.on('emergency_broadcast', (data) => {
            io.emit('emergency_message', {
                type: 'emergency',
                message: data.message,
                priority: data.priority,
                timestamp: new Date()
            });
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });

    // Global function to broadcast disaster alerts
    global.broadcastDisasterAlert = async (disasterData) => {
        try {
            const notification = new Notification({
                type: disasterData.type,
                location: disasterData.location,
                severity: disasterData.severity,
                message: disasterData.message,
                broadcastTo: 'all'
            });
            await notification.save();

            io.emit('new_disaster_alert', {
                id: notification._id,
                ...disasterData,
                timestamp: new Date()
            });
        } catch (error) {
            console.error('Error in global broadcast:', error);
        }
    };
}; 