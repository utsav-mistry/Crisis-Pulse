import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './AdminStyles.css';

const VolunteerHelpVerification = () => {
    const [helpLogs, setHelpLogs] = useState([]);
    const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'verified', 'rejected', 'all'
    const [loading, setLoading] = useState(true);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect if not admin
        if (user && user.role !== 'admin') {
            navigate('/app/dashboard');
            return;
        }

        // Fetch volunteer help logs based on active tab
        const fetchHelpLogs = async () => {
            try {
                setLoading(true);
                let endpoint = '/api/volunteer-help';
                if (activeTab === 'pending') {
                    endpoint = '/api/volunteer-help/pending';
                }

                const response = await axios.get(endpoint, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                });
                let filteredLogs = response.data.data;

                // Filter logs if needed (for verified/rejected tabs)
                if (activeTab === 'verified') {
                    filteredLogs = filteredLogs.filter(log => log.status === 'verified');
                } else if (activeTab === 'rejected') {
                    filteredLogs = filteredLogs.filter(log => log.status === 'rejected');
                }

                setHelpLogs(filteredLogs);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching volunteer help logs:', error);
                toast.error('Failed to load volunteer help logs');
                setLoading(false);
            }
        };

        if (user && user.role === 'admin') {
            fetchHelpLogs();
        }
    }, [user, navigate, activeTab]);

    const handleVerify = async (id, status) => {
        try {
            await axios.put(`/api/volunteer-help/${id}/verify`, { status }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            toast.success(`Volunteer help log has been ${status}`);
            
            // Update the help log status in the list
            setHelpLogs(prev => 
                prev.map(log => 
                    log._id === id 
                        ? { ...log, status, verifiedBy: user.id, verifiedAt: new Date() } 
                        : log
                )
            );
        } catch (error) {
            console.error(`Error ${status} volunteer help log:`, error);
            toast.error(`Failed to ${status} volunteer help log`);
        }
    };

    const openPhotoModal = (photoUrl) => {
        setSelectedPhoto(photoUrl);
    };

    const closePhotoModal = () => {
        setSelectedPhoto(null);
    };

    return (
        <div className="admin-container">
            <h1>Volunteer Help Verification</h1>
            <p className="admin-description">
                Review and verify volunteer help logs. Verified logs will award points to volunteers.
            </p>

            <div className="verification-tabs">
                <button 
                    className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pending')}
                >
                    Pending Verification
                </button>
                <button 
                    className={`tab-button ${activeTab === 'verified' ? 'active' : ''}`}
                    onClick={() => setActiveTab('verified')}
                >
                    Verified
                </button>
                <button 
                    className={`tab-button ${activeTab === 'rejected' ? 'active' : ''}`}
                    onClick={() => setActiveTab('rejected')}
                >
                    Rejected
                </button>
                <button 
                    className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    All Logs
                </button>
            </div>

            {loading ? (
                <div className="loading-spinner">Loading...</div>
            ) : helpLogs.length === 0 ? (
                <div className="no-data-message">
                    <p>No {activeTab} volunteer help logs found.</p>
                </div>
            ) : (
                <div className="help-logs-grid">
                    {helpLogs.map((log) => (
                        <div key={log._id} className={`help-log-verification-card ${log.status}`}>
                            <div className="help-log-header">
                                <h3>{log.disasterId.type} Disaster Help</h3>
                                <span className={`status-badge status-${log.status}`}>
                                    {log.status.toUpperCase()}
                                </span>
                            </div>
                            
                            <div className="help-log-details">
                                <p><strong>Volunteer:</strong> {log.volunteerId.name}</p>
                                <p><strong>Location:</strong> {log.location}</p>
                                <p><strong>Food Packets:</strong> {log.foodPacketsDistributed}</p>
                                <p><strong>Description:</strong> {log.description}</p>
                                <p><strong>Submitted:</strong> {new Date(log.createdAt).toLocaleString()}</p>
                                
                                {log.status === 'verified' && (
                                    <p><strong>Verified On:</strong> {new Date(log.verifiedAt).toLocaleString()}</p>
                                )}
                                
                                {log.status === 'rejected' && (
                                    <p><strong>Rejected On:</strong> {new Date(log.verifiedAt).toLocaleString()}</p>
                                )}
                            </div>
                            
                            <div className="help-log-photos-preview">
                                <h4>Photos ({log.photos.length})</h4>
                                <div className="photos-grid">
                                    {log.photos.slice(0, 4).map((photo, index) => (
                                        <div 
                                            key={index} 
                                            className="photo-thumbnail" 
                                            onClick={() => openPhotoModal(photo)}
                                        >
                                            <img src={photo} alt={`Help proof ${index + 1}`} />
                                        </div>
                                    ))}
                                    {log.photos.length > 4 && (
                                        <div 
                                            className="photo-thumbnail more-photos"
                                            onClick={() => openPhotoModal(log.photos[4])}
                                        >
                                            <div className="more-overlay">+{log.photos.length - 4}</div>
                                            <img src={log.photos[4]} alt="More photos" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {log.status === 'pending' && (
                                <div className="verification-actions">
                                    <button 
                                        className="verify-button"
                                        onClick={() => handleVerify(log._id, 'verified')}
                                    >
                                        Verify & Award Points
                                    </button>
                                    <button 
                                        className="reject-button"
                                        onClick={() => handleVerify(log._id, 'rejected')}
                                    >
                                        Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {selectedPhoto && (
                <div className="photo-modal" onClick={closePhotoModal}>
                    <div className="modal-content">
                        <img src={selectedPhoto} alt="Enlarged view" />
                    </div>
                    <span className="close-modal" onClick={closePhotoModal}>&times;</span>
                </div>
            )}
        </div>
    );
};

export default VolunteerHelpVerification;