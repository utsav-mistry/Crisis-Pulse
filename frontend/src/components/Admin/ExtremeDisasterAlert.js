import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import './ExtremeDisasterAlert.css';

const ExtremeDisasterAlert = ({ socket, user }) => {
    const [extremeAlerts, setExtremeAlerts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (!socket || !user || user.role !== 'admin') return;

        // Listen for extreme disaster alerts
        socket.on('extreme_disaster_alert', (data) => {
            // Add the new alert to the state
            setExtremeAlerts(prev => [
                ...prev, 
                {
                    id: data.id || data.disasterId,
                    type: data.type,
                    location: data.location,
                    severity: data.severity,
                    timestamp: data.timestamp,
                    requiresCrpfNotification: data.requiresCrpfNotification
                }
            ]);

            // Show a toast notification with yes/no buttons
            toast.error(
                <div style={{ cursor: 'pointer' }}>
                    <strong>EXTREME ALERT:</strong> {data.type} disaster detected!
                    <div>Notify CRPF immediately?</div>
                    <div className="toast-buttons">
                        <button 
                            className="toast-yes-button"
                            onClick={() => {
                                // Create CRPF notification directly
                                handleNotifyCrpf(data.id || data.disasterId, data);
                                toast.dismiss();
                            }}
                        >
                            Yes
                        </button>
                        <button 
                            className="toast-no-button"
                            onClick={() => {
                                navigate('/admin/crpf-notifications');
                                toast.dismiss();
                            }}
                        >
                            Review First
                        </button>
                    </div>
                </div>,
                {
                    autoClose: false,
                    closeOnClick: false,
                    draggable: false,
                    closeButton: true,
                    position: toast.POSITION.TOP_CENTER
                }
            );

            // Play an alert sound
            const alertSound = new Audio('/alert-sound.mp3');
            alertSound.play().catch(err => console.error('Error playing alert sound:', err));
        });

        return () => {
            socket.off('extreme_disaster_alert');
        };
    }, [socket, user, navigate]);

    // Handle direct CRPF notification
    const handleNotifyCrpf = async (id, alertData) => {
        try {
            // Call API to notify CRPF
            await axios.put(`/api/crpf-notifications/${id}/status`, { status: 'notified' });
            toast.success('CRPF has been notified');
            
            // Remove from local state
            setExtremeAlerts(prev => prev.filter(alert => alert.id !== id));
        } catch (error) {
            console.error('Error notifying CRPF:', error);
            toast.error('Failed to notify CRPF');
        }
    };

    // If there are no extreme alerts or user is not admin, don't render anything
    if (extremeAlerts.length === 0 || !user || user.role !== 'admin') {
        return null;
    }

    return (
        <div className="extreme-alerts-container">
            {extremeAlerts.map(alert => (
                <div key={alert.id} className="extreme-alert-card">
                    <div className="extreme-alert-header">
                        <h3>{alert.type} - EXTREME ALERT</h3>
                        <span className="extreme-alert-time">
                            {new Date(alert.timestamp).toLocaleString()}
                        </span>
                    </div>
                    <div className="extreme-alert-location">
                        <strong>Location:</strong> {alert.location.city}, {alert.location.state}
                    </div>
                    <div className="extreme-alert-actions">
                        <button 
                            className="notify-button"
                            onClick={() => handleNotifyCrpf(alert.id, alert)}
                        >
                            Notify CRPF Now
                        </button>
                        <button 
                            className="review-button"
                            onClick={() => navigate('/admin/crpf-notifications')}
                        >
                            Review Details
                        </button>
                        <button 
                            className="dismiss-button"
                            onClick={() => {
                                setExtremeAlerts(prev => 
                                    prev.filter(item => item.id !== alert.id)
                                );
                            }}
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ExtremeDisasterAlert;