import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const { user, isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated && user) {
            // Initialize socket connection
            const newSocket = io('http://localhost:5000', {
                auth: {
                    token: localStorage.getItem('token'),
                },
            });

            newSocket.on('connect', () => {
                console.log('Socket connected');
                setIsConnected(true);

                // Join user-specific room
                newSocket.emit('join_user', user.id);

                // Join location-based room if user has location
                if (user.location) {
                    newSocket.emit('join_location', user.location);
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
            newSocket.on('points_updated', (data) => {
                toast.success(`Points updated! +${data.pointsEarned} points`);
            });

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

            setSocket(newSocket);

            return () => {
                newSocket.close();
            };
        }
    }, [isAuthenticated, user]);

    const emitEvent = (event, data) => {
        if (socket && isConnected) {
            socket.emit(event, data);
        }
    };

    const value = {
        socket,
        isConnected,
        emitEvent,
    };

    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
}; 