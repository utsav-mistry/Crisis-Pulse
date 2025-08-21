const Disaster = require('../models/Disaster');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

const connectedUsers = new Map();

module.exports = (io) => {
    // Middleware for socket authentication
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            // Allow unauthenticated users for public notifications
            socket.user = { role: 'public' };
            return next();
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return next(new Error('Authentication error'));
            }
            socket.user = decoded; // Decoded token has user id, role
            next();
        });
    });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id, 'with role:', socket.user.role);
        
        // Add user to connected users map
        if (socket.user.id) {
            connectedUsers.set(socket.user.id, { id: socket.user.id, role: socket.user.role, socketId: socket.id });
            io.to('role_admin').to('role_crpf').emit('user_connected', { userId: socket.user.id, role: socket.user.role });
            // Notify admins of room data change when user connects
            io.to('role_admin').emit('room_data_changed');
        }

        // Join user-specific room and auto-join location room
        if (socket.user.id) {
            socket.join(`user_${socket.user.id}`);
            console.log(`User ${socket.user.id} joined their personal room.`);
            
            // Auto-join user's location room if available
            User.findById(socket.user.id).then(user => {
                if (user && user.location && user.location.city && user.location.state) {
                    const locationRoom = `location_${user.location.city}_${user.location.state}`;
                    socket.join(locationRoom);
                    console.log(`User ${socket.user.id} auto-joined location: ${user.location.city}, ${user.location.state}`);
                    
                    // Notify admins of room data update
                    socket.to('role_admin').emit('room_data_changed');
                }
            }).catch(err => {
                console.error('Error fetching user location:', err);
            });
        }

        // Join role-based rooms
        if (socket.user.role === 'admin') {
            socket.join('role_admin');
            console.log(`Admin user ${socket.user.id} joined admin room.`);
            // Notify about room data change
            socket.to('role_admin').emit('room_data_changed');
        } else if (socket.user.role === 'crpf') {
            socket.join('role_crpf');
            console.log(`CRPF user ${socket.user.id} joined CRPF room.`);
            // Notify about room data change
            socket.to('role_admin').emit('room_data_changed');
        } else if (socket.user.role === 'public') {
            socket.join('public_notifications');
            console.log(`Public user ${socket.id} joined public notifications room.`);
            // Notify about room data change
            socket.to('role_admin').emit('room_data_changed');
        }

        // Join location-based room
        socket.on('join_location', (location) => {
            if (location && location.city && location.state) {
                const locationRoom = `location_${location.city}_${location.state}`;
                socket.join(locationRoom);
                console.log(`User ${socket.id} joined location: ${location.city}, ${location.state}`);
                
                // Notify admins of room data update
                socket.to('role_admin').emit('room_data_changed');
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
            console.log('Admin broadcast received:', data);
            
            const notificationData = {
                type: data.type,
                title: data.title,
                message: data.message,
                priority: data.priority,
                adminName: data.adminName,
                timestamp: data.timestamp,
                source: data.source
            };
            
            // Send to ALL connected users (logged in and public)
            io.emit('admin_notification', notificationData);
            
            // Specifically send to public notifications room for non-authenticated users
            io.to('public_notifications').emit('admin_notification', notificationData);
            
            // Send to all role-based rooms to ensure coverage
            io.to('role_admin').emit('admin_notification', notificationData);
            io.to('role_crpf').emit('admin_notification', notificationData);
            
            console.log('Admin broadcast sent to all users and rooms');
        });

        // Consolidated emergency broadcast handler
        socket.on('emergency-broadcast', (data) => {
            if (socket.user.role !== 'admin') return;
            console.log('Emergency broadcast from admin:', data);
            
            const notification = {
                type: 'emergency',
                title: 'EMERGENCY ALERT',
                message: data.message,
                severity: 'extreme',
                adminName: data.adminName,
                timestamp: data.timestamp
            };

            io.emit('notification', notification);
            io.to('public_notifications').emit('notification', notification);
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

        // Consolidated disaster alert handler from admin test panel
        socket.on('disaster-alert', (data) => {
            if (socket.user.role !== 'admin') return;

            const alertData = {
                type: data.type,
                severity: data.severity,
                location: data.location,
                message: data.message,
                adminTest: data.adminTest,
                timestamp: new Date()
            };

            io.emit('disaster_alert', alertData);
            io.to('public_notifications').emit('disaster_alert', alertData);
        });

        // Handler for admins to request room and user data
        socket.on('admin_get_room_data', () => {
            
            try {
                const rooms = io.sockets.adapter.rooms;
                const roomData = [];
                let totalUsers = 0;

                const usersBySocketId = new Map();
                for (const userData of connectedUsers.values()) {
                    usersBySocketId.set(userData.socketId, userData);
                }

                for (const [roomId, socketIds] of rooms.entries()) {
                    // Skip individual socket IDs (they appear as rooms too) but keep all actual rooms
                    if (socketIds.size === 1 && roomId.length > 10 && !roomId.startsWith('user_') && !roomId.startsWith('location_') && !roomId.startsWith('role_') && roomId !== 'public_notifications') continue;

                    const usersInRoom = [];
                    for (const socketId of socketIds) {
                        if (usersBySocketId.has(socketId)) {
                            const user = usersBySocketId.get(socketId);
                            usersInRoom.push({ id: user.id, role: user.role });
                        } else {
                            // Handle cases where user might not be in the map (e.g., public users)
                            usersInRoom.push({ id: socketId, role: 'public' });
                        }
                    }

                    // Format room names for better display
                    let displayName = roomId;
                    if (roomId.startsWith('user_')) {
                        const userId = roomId.replace('user_', '');
                        displayName = `Personal Room (${userId})`;
                    } else if (roomId.startsWith('location_')) {
                        displayName = roomId.replace('location_', '').replace(/_/g, ', ');
                    } else if (roomId === 'role_admin') {
                        displayName = 'Admin Room';
                    } else if (roomId === 'role_crpf') {
                        displayName = 'CRPF Room';
                    } else if (roomId === 'public_notifications') {
                        displayName = 'Public Notifications';
                    }

                    roomData.push({ 
                        name: displayName, 
                        users: usersInRoom, 
                        userCount: socketIds.size 
                    });
                    totalUsers += socketIds.size;
                }

                socket.emit('room_data_update', { 
                    rooms: roomData, 
                    totalUsers: connectedUsers.size 
                });
            } catch (error) {
                console.error('Error getting room data:', error);
                socket.emit('room_data_update', { error: 'Failed to get room data' });
            }
        });

        socket.on('disconnect', () => {
            if (socket.user.id) {
                connectedUsers.delete(socket.user.id);
                io.to('role_admin').to('role_crpf').emit('user_disconnected', { userId: socket.user.id });
                // Notify about room data change when user disconnects
                io.to('role_admin').emit('room_data_changed');
            }
            console.log('User disconnected:', socket.id);
        });
    });

    // Global function to broadcast disaster alerts
    global.broadcastDisasterAlert = async (disasterData) => {
        try {
            // 1. Fetch AI Safety Advice
            let safetyAdvice = 'Stay safe and follow instructions from local authorities.';
            try {
                const adviceResponse = await axios.post(`${AI_SERVICE_URL}/api/llm-advice`, {
                    disaster_type: disasterData.type,
                    severity: disasterData.severity,
                    location: disasterData.location
                });
                safetyAdvice = adviceResponse.data.advice;
            } catch (aiError) {
                console.error('Error fetching AI safety advice:', aiError.message);
            }

            const alertPayload = {
                ...disasterData,
                safetyAdvice,
                timestamp: new Date(),
                isTest: disasterData.source === 'manual'
            };

            // 2. Find subscribed users near the disaster location (e.g., within 50km)
            const nearbySubscribers = await Subscription.find({
                location: {
                    $near: {
                        $geometry: disasterData.location.coordinates,
                        $maxDistance: 50000 // 50 kilometers
                    }
                }
            });

            // 3. Find all other subscribers
            const allSubscribers = await Subscription.find();

            const notifiedSocketIds = new Set();

            // 4. Send special 'local_disaster_alert' to nearby subscribers
            nearbySubscribers.forEach(sub => {
                if (io.sockets.sockets.has(sub.socketId)) {
                    io.to(sub.socketId).emit('local_disaster_alert', alertPayload);
                    notifiedSocketIds.add(sub.socketId);
                }
            });

            // 5. Send 'new_disaster_alert' to other subscribers who were not notified
            allSubscribers.forEach(sub => {
                if (!notifiedSocketIds.has(sub.socketId) && io.sockets.sockets.has(sub.socketId)) {
                    io.to(sub.socketId).emit('new_disaster_alert', alertPayload);
                }
            });

            console.log(`Disaster alert sent to ${nearbySubscribers.length} nearby subscribers and ${allSubscribers.length - nearbySubscribers.length} other subscribers.`);

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

    // Global function to broadcast CRPF notifications
    global.broadcastCrpfNotification = (notification) => {
        io.emit('crpf_notification', notification);
    };
};