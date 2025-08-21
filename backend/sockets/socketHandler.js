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
        }

        // Join user-specific room
        if (socket.user.id) {
            socket.join(`user_${socket.user.id}`);
            console.log(`User ${socket.user.id} joined their personal room.`);
        }

        // Join role-based rooms
        if (socket.user.role === 'admin') {
            socket.join('role_admin');
            console.log(`Admin user ${socket.user.id} joined admin room.`);
        } else if (socket.user.role === 'crpf') {
            socket.join('role_crpf');
            console.log(`CRPF user ${socket.user.id} joined CRPF room.`);
        } else if (socket.user.role === 'public') {
            socket.join('public_notifications');
            console.log(`Public user ${socket.id} joined public notifications room.`);
        }

        // Join location-based room
        socket.on('join_location', (location) => {
            if (location && location.city && location.state) {
                socket.join(`location_${location.city}_${location.state}`);
                console.log(`User ${socket.id} joined location: ${location.city}, ${location.state}`);
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
        if (socket.user.role === 'admin') {
            socket.on('admin_get_rooms', () => {
                const rooms = io.sockets.adapter.rooms;
                const roomData = [];

                const usersBySocketId = new Map();
                for (const userData of connectedUsers.values()) {
                    usersBySocketId.set(userData.socketId, userData);
                }

                for (const [roomId, socketIds] of rooms.entries()) {
                    if (roomId.startsWith('user_')) continue; // Skip personal rooms for privacy

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

                    roomData.push({ room: roomId, users: usersInRoom, count: socketIds.size });
                }

                socket.emit('admin_room_data', roomData);
            });
        }

        socket.on('disconnect', () => {
            if (socket.user.id) {
                connectedUsers.delete(socket.user.id);
                io.to('role_admin').to('role_crpf').emit('user_disconnected', { userId: socket.user.id });
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