import React, { useState, useEffect } from 'react';
import { Bell, BellOff, X, Shield, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

const NotificationSubscribe = () => {
    const { user } = useAuth();
    const { socket } = useSocket();
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [showPrompt, setShowPrompt] = useState(false);
    const [notificationPermission, setNotificationPermission] = useState('default');

    useEffect(() => {
        // Check notification permission status
        if ('Notification' in window) {
            setNotificationPermission(Notification.permission);
        }

        // Only show for non-logged in users
        if (!user) {
            // Check if user has already made a choice
            const hasChosenNotifications = localStorage.getItem('notificationChoice');
            if (!hasChosenNotifications) {
                // Show prompt after 3 seconds
                const timer = setTimeout(() => {
                    setShowPrompt(true);
                }, 3000);
                return () => clearTimeout(timer);
            } else {
                setIsSubscribed(hasChosenNotifications === 'subscribed');
            }
        }
    }, [user]);

    useEffect(() => {
        // Listen for disaster alerts if subscribed and not logged in
        if (!user && isSubscribed && socket) {
            const handleDisasterAlert = (alert) => {
                // Show browser notification
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification(`🚨 ${alert.type} Alert`, {
                        body: `${alert.severity} severity in ${alert.location?.city}, ${alert.location?.state}`,
                        icon: '/favicon.ico',
                        tag: `disaster-${alert._id}`,
                        requireInteraction: alert.severity === 'critical'
                    });
                }

                // Show toast notification
                toast.error(`🚨 ${alert.type} Alert in ${alert.location?.city}`, {
                    duration: 8000,
                    position: 'top-center'
                });
            };

            const handleCrpfAlert = (alert) => {
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('🛡️ CRPF Response Alert', {
                        body: alert.message,
                        icon: '/favicon.ico',
                        tag: `crpf-${Date.now()}`
                    });
                }

                toast(`🛡️ CRPF: ${alert.message}`, {
                    duration: 6000,
                    position: 'top-center'
                });
            };

            socket.on('disasterAlert', handleDisasterAlert);
            socket.on('crpfAlert', handleCrpfAlert);

            return () => {
                socket.off('disasterAlert', handleDisasterAlert);
                socket.off('crpfAlert', handleCrpfAlert);
            };
        }
    }, [user, isSubscribed, socket]);

    const handleSubscribe = async () => {
        setIsSubscribed(true);
        setShowPrompt(false);
        localStorage.setItem('notificationChoice', 'subscribed');
        
        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            setNotificationPermission(permission);
            
            if (permission === 'granted') {
                new Notification('Crisis Pulse Notifications Enabled', {
                    body: 'You will now receive disaster alerts and emergency updates.',
                    icon: '/favicon.ico'
                });
                toast.success('Notifications enabled! You\'ll receive disaster alerts.');
            } else {
                toast.error('Notification permission denied. You can still see alerts on the website.');
            }
        } else if (Notification.permission === 'granted') {
            toast.success('Notifications enabled! You\'ll receive disaster alerts.');
        }
    };

    const handleDecline = () => {
        setIsSubscribed(false);
        setShowPrompt(false);
        localStorage.setItem('notificationChoice', 'declined');
        toast('You can enable notifications anytime from the bottom-right corner.', {
            duration: 4000
        });
    };

    const handleUnsubscribe = () => {
        setIsSubscribed(false);
        localStorage.setItem('notificationChoice', 'declined');
        toast('Notifications disabled. You can re-enable them anytime.');
    };

    const handleResubscribe = () => {
        handleSubscribe();
    };

    // Don't show anything for logged-in users
    if (user) {
        return null;
    }

    // Show subscription status for users who have already chosen
    if (!showPrompt && localStorage.getItem('notificationChoice')) {
        return (
            <div className="fixed bottom-4 right-4 z-40">
                <div className="bg-white rounded-lg shadow-lg border border-neutral-200 p-3 max-w-xs">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            {isSubscribed ? (
                                <div className="flex items-center space-x-1">
                                    <Bell className="w-4 h-4 text-green-600" />
                                    <span className="text-xs font-medium text-green-700">
                                        Alerts On
                                    </span>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-1">
                                    <BellOff className="w-4 h-4 text-neutral-500" />
                                    <span className="text-xs font-medium text-neutral-600">
                                        Alerts Off
                                    </span>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={isSubscribed ? handleUnsubscribe : handleResubscribe}
                            className={`text-xs px-2 py-1 rounded transition-colors ${
                                isSubscribed 
                                    ? 'text-red-600 hover:bg-red-50 hover:text-red-700' 
                                    : 'text-green-600 hover:bg-green-50 hover:text-green-700'
                            }`}
                        >
                            {isSubscribed ? 'Turn Off' : 'Turn On'}
                        </button>
                    </div>
                    {isSubscribed && notificationPermission !== 'granted' && (
                        <div className="mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded">
                            <AlertTriangle className="w-3 h-3 inline mr-1" />
                            Browser notifications blocked
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Show initial prompt
    if (showPrompt) {
        return (
            <div className="fixed bottom-4 right-4 z-40">
                <div className="bg-white rounded-lg shadow-xl border border-neutral-200 p-6 max-w-sm animate-slide-in-right">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                                <Bell className="w-4 h-4 text-primary-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-neutral-900">Stay Alert</h3>
                                <p className="text-xs text-neutral-500">Crisis Pulse Notifications</p>
                            </div>
                        </div>
                        <button
                            onClick={handleDecline}
                            className="text-neutral-400 hover:text-neutral-600 p-1"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="text-sm text-neutral-600 mb-4">
                        Get instant alerts about disasters, emergencies, and CRPF responses in your area. 
                        Stay informed without creating an account.
                    </p>
                    <div className="flex items-center space-x-2 mb-4 text-xs text-neutral-500">
                        <Shield className="w-3 h-3" />
                        <span>No personal data stored • Unsubscribe anytime</span>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={handleSubscribe}
                            className="btn btn-primary btn-sm flex-1 text-xs"
                        >
                            Enable Alerts
                        </button>
                        <button
                            onClick={handleDecline}
                            className="btn btn-outline btn-sm flex-1 text-xs"
                        >
                            Not Now
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default NotificationSubscribe;