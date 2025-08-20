import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Bell, Shield, Info } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

const GlobalAlert = () => {
    const [alerts, setAlerts] = useState([]);
    const [isVisible, setIsVisible] = useState(false);
    const { socket } = useSocket();

    useEffect(() => {
        if (socket) {
            // Listen for global alerts
            socket.on('globalAlert', (alert) => {
                setAlerts(prev => [alert, ...prev.slice(0, 2)]); // Keep max 3 alerts
                setIsVisible(true);
                
                // Auto-hide after 10 seconds for non-critical alerts
                if (alert.severity !== 'critical') {
                    setTimeout(() => {
                        setAlerts(prev => prev.filter(a => a.id !== alert.id));
                    }, 10000);
                }
            });

            // Listen for CRPF alerts
            socket.on('crpfAlert', (alert) => {
                const crpfAlert = {
                    id: `crpf-${Date.now()}`,
                    type: 'crpf',
                    severity: 'high',
                    title: 'CRPF Response Alert',
                    message: alert.message,
                    location: alert.location,
                    timestamp: new Date()
                };
                
                setAlerts(prev => [crpfAlert, ...prev.slice(0, 2)]);
                setIsVisible(true);
            });

            return () => {
                socket.off('globalAlert');
                socket.off('crpfAlert');
            };
        }
    }, [socket]);

    const dismissAlert = (alertId) => {
        setAlerts(prev => prev.filter(alert => alert.id !== alertId));
        if (alerts.length <= 1) {
            setIsVisible(false);
        }
    };

    const dismissAll = () => {
        setAlerts([]);
        setIsVisible(false);
    };

    const getAlertIcon = (type, severity) => {
        switch (type) {
            case 'crpf':
                return <Shield className="w-5 h-5 text-blue-600" />;
            case 'emergency':
                return <AlertTriangle className="w-5 h-5 text-red-600" />;
            case 'warning':
                return <Bell className="w-5 h-5 text-yellow-600" />;
            default:
                return <Info className="w-5 h-5 text-blue-600" />;
        }
    };

    const getAlertStyles = (severity) => {
        switch (severity) {
            case 'critical':
                return 'border-red-500 bg-red-50 text-red-900';
            case 'high':
                return 'border-orange-500 bg-orange-50 text-orange-900';
            case 'medium':
                return 'border-yellow-500 bg-yellow-50 text-yellow-900';
            default:
                return 'border-blue-500 bg-blue-50 text-blue-900';
        }
    };

    if (!isVisible || alerts.length === 0) {
        return null;
    }

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
            {alerts.map((alert) => (
                <div
                    key={alert.id}
                    className={`border-l-4 p-4 rounded-lg shadow-lg backdrop-blur-sm ${getAlertStyles(alert.severity)} animate-slide-in-right`}
                >
                    <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                            {getAlertIcon(alert.type, alert.severity)}
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold mb-1">
                                    {alert.title}
                                </h4>
                                <p className="text-sm opacity-90 mb-2">
                                    {alert.message}
                                </p>
                                {alert.location && (
                                    <p className="text-xs opacity-75">
                                        📍 {alert.location.city}, {alert.location.state}
                                    </p>
                                )}
                                <p className="text-xs opacity-60 mt-1">
                                    {new Date(alert.timestamp).toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => dismissAlert(alert.id)}
                            className="ml-2 p-1 rounded-full hover:bg-black hover:bg-opacity-10 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ))}
            
            {alerts.length > 1 && (
                <div className="text-center">
                    <button
                        onClick={dismissAll}
                        className="text-xs text-neutral-600 hover:text-neutral-800 underline"
                    >
                        Dismiss all alerts
                    </button>
                </div>
            )}
        </div>
    );
};

export default GlobalAlert;
