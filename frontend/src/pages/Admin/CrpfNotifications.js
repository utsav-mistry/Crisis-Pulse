import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import './AdminStyles.css';

const CrpfNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'all'
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    // Redirect if not admin
    useEffect(() => {
        if (user && user.role !== 'admin') {
            navigate('/dashboard');
            toast.error('Unauthorized access');
        }
    }, [user, navigate]);

    // Fetch CRPF notifications based on active tab
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                setLoading(true);
                const endpoint = activeTab === 'pending' ? '/api/crpf-notifications/pending' : '/api/crpf-notifications';
                const response = await axios.get(endpoint);
                setNotifications(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching CRPF notifications:', error);
                toast.error(`Failed to load ${activeTab} notifications`);
                setLoading(false);
            }
        };

        if (user && user.role === 'admin') {
            fetchNotifications();
        }
    }, [user, activeTab]);

    // Handle notification to CRPF
    const handleNotifyCrpf = async (id) => {
        try {
            await axios.put(`/api/crpf-notifications/${id}/status`, { status: 'notified' });
            toast.success('CRPF has been notified');
            
            // Update the notification status in the list
            setNotifications(prev => 
                prev.map(notification => 
                    notification._id === id 
                        ? { ...notification, status: 'notified' } 
                        : notification
                )
            );
        } catch (error) {
            console.error('Error notifying CRPF:', error);
            toast.error('Failed to notify CRPF');
        }
    };

    if (!user || user.role !== 'admin') {
        return null; // Don't render anything if not admin
    }

    return (
        <div className="admin-container">
            <h1>CRPF Notifications</h1>
            <p className="admin-description">
                Review and notify CRPF about extreme disasters. This panel shows disasters that require CRPF notification.
            </p>

            <div className="notification-tabs">
                <button 
                    className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pending')}
                >
                    Pending Notifications
                </button>
                <button 
                    className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    All Notifications
                </button>
            </div>

            {loading ? (
                <div className="loading-spinner">Loading...</div>
            ) : notifications.length === 0 ? (
                <div className="no-data-message">
                    <p>No {activeTab} CRPF notifications at this time.</p>
                </div>
            ) : (
                <div className="notification-list">
                    {notifications.map((notification) => (
                        <div key={notification._id} className="notification-card extreme">
                            <div className="notification-header">
                                <h3>{notification.disasterId.type} - {notification.disasterId.severity.toUpperCase()}</h3>
                                <span className="notification-date">
                                    {new Date(notification.disasterId.createdAt).toLocaleString()}
                                </span>
                            </div>
                            <div className="notification-location">
                                <strong>Location:</strong> {notification.disasterId.location.city}, {notification.disasterId.location.state}
                            </div>
                            <div className="notification-status">
                                <strong>Status:</strong> 
                                {notification.status === 'pending' ? (
                                    <span className="status-pending">Pending CRPF Notification</span>
                                ) : (
                                    <span className="status-notified">
                                        Notified on {new Date(notification.notifiedAt).toLocaleString()}
                                    </span>
                                )}
                            </div>
                            {notification.status === 'pending' && (
                                <div className="notification-actions">
                                    <button 
                                        className="notify-button"
                                        onClick={() => handleNotifyCrpf(notification._id)}
                                    >
                                        Confirm CRPF Notification
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CrpfNotifications;