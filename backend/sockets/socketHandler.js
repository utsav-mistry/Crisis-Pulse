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
        socket.on('join_user', (userData) => {
            const { userId, role } = userData;
            socket.join(`user_${userId}`);
            console.log(`User joined personal room: ${userId}`);
            
            // If user is admin, join admin room
            if (role === 'admin') {
                socket.join('role_admin');
                console.log(`Admin user joined admin room: ${userId}`);
            }
        });
        
        // Join public notifications room for non-logged in users
        socket.on('join_public_notifications', () => {
            socket.join('public_notifications');
            console.log(`User joined public notifications room: ${socket.id}`);
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
                
                // Also send to public notifications room for non-logged in users
                io.to('public_notifications').emit('new_disaster_alert', {
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

        // Handle admin test notifications
        socket.on('admin-test-notification', (data) => {
            io.emit('admin_test_notification', {
                message: data.message,
                adminName: data.adminName,
                timestamp: new Date()
            });
        });

        // Handle emergency alerts from admin
        socket.on('emergency-alert', (data) => {
            io.emit('emergency_alert', {
                message: data.message,
                severity: data.severity,
                adminName: data.adminName,
                timestamp: new Date()
            });
        });

        // Handle admin broadcast notifications
        socket.on('admin-broadcast', (data) => {
            // Send to all connected users
            io.emit('admin_notification', {
                type: data.type,
                message: data.message,
                adminName: data.adminName,
                timestamp: data.timestamp
            });
            
            // Also send to public notifications room
            io.to('public_notifications').emit('admin_notification', {
                type: data.type,
                message: data.message,
                adminName: data.adminName,
                timestamp: data.timestamp
            });
        });

        // Handle emergency broadcast from admin
        socket.on('emergency-broadcast', (data) => {
            console.log('Emergency broadcast from admin:', data);
            
            // Broadcast to all connected users
            io.emit('notification', {
                type: 'emergency',
                title: 'EMERGENCY ALERT',
                message: data.message,
                severity: 'extreme',
                adminName: data.adminName,
                timestamp: data.timestamp
            });

            // Also send to public notifications room for non-logged-in users
            io.to('public_notifications').emit('notification', {
                type: 'emergency',
                title: 'EMERGENCY ALERT',
                message: data.message,
                severity: 'extreme',
                adminName: data.adminName,
                timestamp: data.timestamp
            });
        });

        // Handle severity-based notifications from admin
        socket.on('severity-notification', (data) => {
            console.log('Severity notification from admin:', data);
            
            // Broadcast to all connected users
            io.emit('notification', {
                type: 'severity',
                title: data.title,
                message: data.message,
                severity: data.severity,
                adminName: data.adminName,
                timestamp: data.timestamp
            });

            // Also send to public notifications room for non-logged-in users
            io.to('public_notifications').emit('notification', {
                type: 'severity',
                title: data.title,
                message: data.message,
                severity: data.severity,
                adminName: data.adminName,
                timestamp: data.timestamp
            });
        });


        // Handle CRPF notifications
        socket.on('crpf-notification', (data) => {
            // Send to all admins
            io.to('role_admin').emit('crpf_notification', {
                title: data.title,
                message: data.message,
                priority: data.priority,
                adminName: data.adminName,
                timestamp: data.timestamp
            });
        });

        // Handle disaster alerts from test panel
        socket.on('disaster-alert', (data) => {
            // Send to all connected users
            io.emit('disaster_alert', {
                type: data.type,
                severity: data.severity,
                location: data.location,
                message: data.message,
                adminTest: data.adminTest,
                timestamp: new Date()
            });
            
            // Also send to public notifications room
            io.to('public_notifications').emit('disaster_alert', {
                type: data.type,
                severity: data.severity,
                location: data.location,
                message: data.message,
                adminTest: data.adminTest,
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

            // Determine if this is a test or predicted disaster
            const isTestOrPredicted = disasterData.source === 'manual' || disasterData.predictionDate;
            
            // Broadcast to all connected users
            io.emit('new_disaster_alert', {
                id: notification._id,
                ...disasterData,
                timestamp: new Date(),
                isTest: disasterData.source === 'manual'
            });
            
            // Specifically target public_notifications room for non-logged in users who have allowed notifications
            io.to('public_notifications').emit('new_disaster_alert', {
                id: notification._id,
                ...disasterData,
                timestamp: new Date(),
                isTest: disasterData.source === 'manual'
            });
            
            // If this is a high severity disaster, send an extreme alert to admins
            if (disasterData.severity === 'high') {
                io.to('role_admin').emit('extreme_disaster_alert', {
                    id: notification._id,
                    ...disasterData,
                    timestamp: new Date(),
                    requiresCrpfNotification: true
                });
            }
            
            // If this is a test or predicted disaster, also notify volunteers
            // so they can sign up to help
            if (isTestOrPredicted) {
                // Find all users with volunteer role
                const volunteers = await User.find({ role: 'volunteer', isBanned: { $ne: true } });
                
                // Send notification to each volunteer
                for (const volunteer of volunteers) {
                    io.to(`user_${volunteer._id}`).emit('volunteer_help_opportunity', {
                        disasterId: notification._id,
                        type: disasterData.type,
                        location: disasterData.location,
                        severity: disasterData.severity,
                        message: `${disasterData.message} - Volunteers needed!`,
                        timestamp: new Date()
                    });
                }
            }
        } catch (error) {
            console.error('Error in global broadcast:', error);
        }
    };
    
    // Global function to notify admins about extreme disasters
    global.notifyAdminsOfExtremeDisaster = async (disasterId, disasterData) => {
        try {
            io.to('role_admin').emit('extreme_disaster_alert', {
                disasterId,
                ...disasterData,
                timestamp: new Date(),
                requiresCrpfNotification: true
            });
        } catch (error) {
            console.error('Error notifying admins of extreme disaster:', error);
        }
    };
};