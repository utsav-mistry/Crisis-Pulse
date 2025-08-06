import React from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const NotificationSubscribe = () => {
    const { notificationsEnabled, enableNotifications } = useSocket();
    const { isAuthenticated } = useAuth();

    // Only show for non-authenticated users
    if (isAuthenticated) {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {!notificationsEnabled ? (
                <button
                    onClick={enableNotifications}
                    className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg shadow-lg transition-all duration-200 ease-in-out transform hover:scale-105"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                    </svg>
                    <span>Enable Disaster Alerts</span>
                </button>
            ) : (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-lg shadow-md">
                    <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Disaster Alerts Enabled</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationSubscribe;