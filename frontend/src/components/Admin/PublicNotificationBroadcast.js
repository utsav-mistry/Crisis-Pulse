import React, { useState, useEffect } from 'react';
import { Send, Bell, AlertTriangle, Info, CheckCircle, Users, Megaphone } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import pushNotificationManager from '../../utils/pushNotifications';
import toast from 'react-hot-toast';

const PublicNotificationBroadcast = () => {
    const [message, setMessage] = useState('');
    const [title, setTitle] = useState('');
    const [notificationType, setNotificationType] = useState('info');
    const [priority, setPriority] = useState('normal');
    const [sending, setSending] = useState(false);
    const [pushStatus, setPushStatus] = useState(null);
    const { socket, isConnected } = useSocket();

    useEffect(() => {
        // Initialize push notifications
        const initPush = async () => {
            const status = await pushNotificationManager.initialize();
            setPushStatus(pushNotificationManager.getSubscriptionStatus());
        };
        initPush();
    }, []);

    const notificationTypes = [
        { value: 'emergency', label: 'Emergency Alert', icon: AlertTriangle, color: 'text-red-600 bg-red-50 border-red-200' },
        { value: 'warning', label: 'Warning', icon: Bell, color: 'text-orange-600 bg-orange-50 border-orange-200' },
        { value: 'info', label: 'Information', icon: Info, color: 'text-blue-600 bg-blue-50 border-blue-200' },
        { value: 'success', label: 'Success/Update', icon: CheckCircle, color: 'text-green-600 bg-green-50 border-green-200' }
    ];

    const priorityLevels = [
        { value: 'low', label: 'Low Priority' },
        { value: 'normal', label: 'Normal Priority' },
        { value: 'high', label: 'High Priority' },
        { value: 'critical', label: 'Critical Priority' }
    ];

    const handleSendNotification = async () => {
        if (!title.trim() || !message.trim()) {
            toast.error('Please enter both title and message');
            return;
        }

        setSending(true);
        try {
            const notificationData = {
                title: title.trim(),
                message: message.trim(),
                type: notificationType,
                priority: priority,
                timestamp: new Date().toISOString(),
                adminName: 'Admin', // You can get this from auth context
                source: 'admin_broadcast'
            };

            // Send via socket for real-time users
            if (socket && isConnected) {
                socket.emit('admin-broadcast', notificationData);
                console.log('Sent via socket:', notificationData);
            }

            // Send push notification for offline users
            if (pushStatus?.isSupported) {
                try {
                    const response = await fetch('/api/push/broadcast', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: JSON.stringify(notificationData)
                    });

                    if (response.ok) {
                        console.log('Push notification sent successfully');
                    } else {
                        console.warn('Push notification failed:', await response.text());
                    }
                } catch (pushError) {
                    console.error('Push notification error:', pushError);
                }
            }

            // Test local notification
            await pushNotificationManager.sendTestNotification(title, message);

            toast.success('Public notification sent successfully!');
            
            // Clear form
            setTitle('');
            setMessage('');
            setNotificationType('info');
            setPriority('normal');

        } catch (error) {
            console.error('Error sending notification:', error);
            toast.error('Failed to send notification');
        } finally {
            setSending(false);
        }
    };

    const handleTestNotification = async () => {
        try {
            await pushNotificationManager.sendTestNotification(
                'Crisis Pulse Test',
                'This is a test notification to verify push notifications are working.'
            );
            toast.success('Test notification sent!');
        } catch (error) {
            console.error('Test notification failed:', error);
            toast.error('Test notification failed');
        }
    };

    const selectedType = notificationTypes.find(type => type.value === notificationType);
    const TypeIcon = selectedType?.icon || Info;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Megaphone className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Public Notification Broadcast</h2>
                        <p className="text-sm text-gray-600">Send app-wide notifications to all users (online & offline)</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">All Users</span>
                </div>
            </div>

            {/* Push Notification Status */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Push Notifications Status:</span>
                    <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${pushStatus?.isSupported ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-sm text-gray-600">
                            {pushStatus?.isSupported ? 'Supported' : 'Not Supported'}
                        </span>
                        {pushStatus?.permission && (
                            <span className="text-xs px-2 py-1 bg-gray-200 rounded">
                                {pushStatus.permission}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {/* Notification Type */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notification Type
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {notificationTypes.map((type) => {
                            const Icon = type.icon;
                            return (
                                <button
                                    key={type.value}
                                    onClick={() => setNotificationType(type.value)}
                                    className={`p-3 rounded-lg border-2 transition-all ${
                                        notificationType === type.value 
                                            ? type.color 
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <Icon className="w-5 h-5 mx-auto mb-1" />
                                    <div className="text-xs font-medium">{type.label}</div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Priority Level */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priority Level
                    </label>
                    <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        {priorityLevels.map(level => (
                            <option key={level.value} value={level.value}>
                                {level.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notification Title
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter notification title..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        maxLength={100}
                    />
                    <div className="text-xs text-gray-500 mt-1">{title.length}/100 characters</div>
                </div>

                {/* Message */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message Content
                    </label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Enter your notification message..."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        maxLength={500}
                    />
                    <div className="text-xs text-gray-500 mt-1">{message.length}/500 characters</div>
                </div>

                {/* Preview */}
                {(title || message) && (
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="text-sm font-medium text-gray-700 mb-2">Preview:</div>
                        <div className={`p-3 rounded-lg border ${selectedType?.color || 'border-gray-200'}`}>
                            <div className="flex items-center space-x-2 mb-2">
                                <TypeIcon className="w-4 h-4" />
                                <span className="font-medium text-sm">{title || 'Notification Title'}</span>
                            </div>
                            <p className="text-sm text-gray-700">{message || 'Notification message content...'}</p>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                    <button
                        onClick={handleSendNotification}
                        disabled={sending || !title.trim() || !message.trim()}
                        className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="w-4 h-4" />
                        <span>{sending ? 'Sending...' : 'Send Public Notification'}</span>
                    </button>
                    
                    <button
                        onClick={handleTestNotification}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Test Push
                    </button>
                </div>
            </div>

            {/* Connection Status */}
            <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Socket Connection:</span>
                    <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
                            {isConnected ? 'Connected' : 'Disconnected'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicNotificationBroadcast;
