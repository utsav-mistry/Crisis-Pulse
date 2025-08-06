import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';
import ExtremeDisasterAlert from '../components/Admin/ExtremeDisasterAlert';

const SocketContext = createContext();

useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const { user, isAuthenticated } = useAuth();

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

            // For authenticated users, join user-specific room
            if (isAuthenticated && user) {
                // Pass both userId and role to join appropriate rooms
                newSocket.emit('join_user', {
                    userId: user.id,
                    role: user.role
                });

                // Join location-based room if user has location
                if (user.location) {
                    newSocket.emit('join_location', user.location);
                }
            }
            
            // For non-authenticated users with notifications enabled
            if (!isAuthenticated && notificationsEnabled) {
                newSocket.emit('join_public_notifications');
            }
        });

        newSocket.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        });

        // Listen for disaster alerts
        newSocket.on('new_disaster_alert', (data) => {
                toast.custom((t) => (
                    <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
                        <div className="flex-1 w-0 p-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-danger-100 rounded-full flex items-center justify-center">
                                        <span className="text-danger-600 text-sm font-bold">!</span>
                                    </div>
                                </div>
                                <div className="ml-3 flex-1">
                                    <p className="text-sm font-medium text-gray-900">
                                        Disaster Alert
                                    </p>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {data.message}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-400">
                                        {new Date(data.timestamp).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ), {
                    duration: 8000,
                });
            });

        // Listen for local disaster alerts
        newSocket.on('local_disaster_alert', (data) => {
                toast.custom((t) => (
                    <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-l-4 border-warning-500`}>
                        <div className="flex-1 w-0 p-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-warning-100 rounded-full flex items-center justify-center">
                                        <span className="text-warning-600 text-sm font-bold">⚠</span>
                                    </div>
                                </div>
                                <div className="ml-3 flex-1">
                                    <p className="text-sm font-medium text-gray-900">
                                        Local Alert
                                    </p>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {data.message}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-400">
                                        {new Date(data.timestamp).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ), {
                    duration: 10000,
                });
            });

        // Listen for points updates
        if (isAuthenticated && user) {
            newSocket.on('points_updated', (data) => {
                toast.success(`Points updated! +${data.pointsEarned} points`);
            });
            
            // Listen for volunteer help opportunities
            if (user.role === 'volunteer') {
                newSocket.on('volunteer_help_opportunity', (data) => {
                    toast.custom((t) => (
                        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-l-4 border-primary-500`}>
                            <div className="flex-1 w-0 p-4">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                                            <span className="text-primary-600 text-sm font-bold">🆘</span>
                                        </div>
                                    </div>
                                    <div className="ml-3 flex-1">
                                        <p className="text-sm font-medium text-gray-900">
                                            Volunteer Help Needed
                                        </p>
                                        <p className="mt-1 text-sm text-gray-500">
                                            {data.message}
                                        </p>
                                        <div className="mt-2 flex space-x-2">
                                            <a 
                                                href="/volunteer/sign-up" 
                                                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                            >
                                                Sign Up to Help
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ), {
                        duration: 15000,
                    });
                });
            }

            // Listen for emergency messages
            newSocket.on('emergency_message', (data) => {
                toast.custom((t) => (
                    <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-danger-50 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-danger-500 ring-opacity-5 border-l-4 border-danger-500`}>
                        <div className="flex-1 w-0 p-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-danger-100 rounded-full flex items-center justify-center">
                                        <span className="text-danger-600 text-sm font-bold">🚨</span>
                                    </div>
                                </div>
                                <div className="ml-3 flex-1">
                                    <p className="text-sm font-medium text-danger-900">
                                        Emergency Alert
                                    </p>
                                    <p className="mt-1 text-sm text-danger-700">
                                        {data.message}
                                    </p>
                                    <p className="mt-1 text-xs text-danger-600">
                                        {new Date(data.timestamp).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ), {
                    duration: 15000,
                });
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
        
        // If socket is already connected, join the public notifications room
        if (socket && isConnected && !isAuthenticated) {
            socket.emit('join_public_notifications');
            toast.success('Notifications enabled successfully!');
        }
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
        enableNotifications
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