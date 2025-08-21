import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import api from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';
import ExtremeDisasterAlert from '../components/Admin/ExtremeDisasterAlert';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const { user, isAuthenticated } = useAuth();

    const fetchNotifications = async () => {
        if (!isAuthenticated) return;
        try {
            const res = await api.get('/notifications/me');
            setNotifications(res.data);
            setUnreadCount(res.data.filter(n => !n.read).length);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications();
        }
    }, [isAuthenticated]);

    useEffect(() => {
        // Initialize socket connection for both authenticated and non-authenticated users
        const newSocket = io('http://localhost:5000', {
            auth: {
                token: isAuthenticated ? localStorage.getItem('token') : null,
            },
        });

        newSocket.on('connect', () => {
            console.log('Socket connected');
            setIsConnected(true);

            // For authenticated users, join location-based room if location is available
            if (isAuthenticated && user && user.location) {
                newSocket.emit('join_location', user.location);
            }
        });

        newSocket.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        });

        // Listen for disaster alerts
        newSocket.on('new_disaster_alert', (data) => {
            toast.error(`🚨 ${data.message}`, { duration: 8000 });
        });

        // Listen for user-specific notifications
        newSocket.on('new_notification', (data) => {
            setNotifications(prev => [data, ...prev]);
            setUnreadCount(prev => prev + 1);
            toast.info(data.message, { icon: '🔔' });
        });

        // Listen for local disaster alerts
        newSocket.on('local_disaster_alert', (data) => {
            toast.error(`🚨 LOCAL ALERT: ${data.message} (${data.severity?.toUpperCase()})`, { 
                duration: 15000,
                position: 'top-center'
            });
        });

        // Listen for AI predictions from disaster_ai
        newSocket.on('new-ai-prediction', (data) => {
            console.log('Received AI prediction:', data);
            if (data.predictions && data.predictions.length > 0) {
                const highRiskPredictions = data.predictions.filter(p => p.severity === 'high');
                if (highRiskPredictions.length > 0) {
                    toast.warning(`AI Alert: ${highRiskPredictions.length} high-risk disaster(s) predicted`, { duration: 8000 });
                }
            }
        });

        // Listen for points updates
        if (isAuthenticated && user) {
            newSocket.on('points_updated', (data) => {
                toast.success(`Points updated! +${data.pointsEarned} points`);
            });
            
            // Listen for volunteer help opportunities
            if (user.role === 'volunteer') {
                newSocket.on('volunteer_help_opportunity', (data) => {
                    toast.info(`🆘 Volunteer Help Needed: ${data.message}`, { duration: 15000 });
                });
            }

            // Listen for emergency messages
            newSocket.on('emergency_message', (data) => {
                toast.error(`🚨 EMERGENCY: ${data.message}`, { duration: 15000 });
            });
        }
        
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [isAuthenticated, user, notificationsEnabled]);

    const emitEvent = (event, data) => {
        if (socket && isConnected) {
            socket.emit(event, data);
        }
    };

    // Function to enable notifications for non-logged in users
    const enableNotifications = () => {
        setNotificationsEnabled(true);
        localStorage.setItem('notificationsEnabled', 'true');
        toast.success('Notifications enabled successfully! Please refresh the page to see public alerts.');
    };

    // Check if notifications were previously enabled
    useEffect(() => {
        const savedNotificationsState = localStorage.getItem('notificationsEnabled');
        if (savedNotificationsState === 'true') {
            setNotificationsEnabled(true);
        }
    }, []);

    const value = {
        socket,
        isConnected,
        emitEvent,
        notificationsEnabled,
        enableNotifications,
        notifications,
        unreadCount,
        fetchNotifications,
        markAsRead: async (id) => {
            try {
                await api.put(`/notifications/${id}/read`);
                setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
            } catch (error) {
                console.error('Failed to mark notification as read', error);
            }
        },
        markAllAsRead: async () => {
            try {
                await api.put('/notifications/read-all');
                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                setUnreadCount(0);
            } catch (error) {
                console.error('Failed to mark all notifications as read', error);
            }
        }
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
            {/* Render ExtremeDisasterAlert component for admin users */}
            {isAuthenticated && user && user.role === 'admin' && (
                <ExtremeDisasterAlert socket={socket} user={user} />
            )}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};