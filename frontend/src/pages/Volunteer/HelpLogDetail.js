import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './VolunteerStyles.css';

const HelpLogDetail = () => {
    const [helpLog, setHelpLog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect if not volunteer
        if (user && user.role !== 'volunteer') {
            navigate('/dashboard');
            return;
        }

        // Fetch help log details
        const fetchHelpLogDetail = async () => {
            try {
                const response = await axios.get(`/api/volunteer-help/${id}`);
                setHelpLog(response.data.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching help log details:', error);
                toast.error('Failed to load help log details');
                setLoading(false);
                navigate('/volunteer/dashboard');
            }
        };

        if (user && user.role === 'volunteer') {
            fetchHelpLogDetail();
        }
    }, [id, user, navigate]);

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'verified': return 'status-verified';
            case 'rejected': return 'status-rejected';
            default: return 'status-pending';
        }
    };

    const openPhotoModal = (photoUrl) => {
        setSelectedPhoto(photoUrl);
    };

    const closePhotoModal = () => {
        setSelectedPhoto(null);
    };

    if (loading) {
        return <div className="loading-spinner">Loading...</div>;
    }

    if (!helpLog) {
        return <div className="no-data-message">Help log not found</div>;
    }

    return (
        <div className="volunteer-container">
            <div className="back-link">
                <Link to="/volunteer/dashboard">&larr; Back to Dashboard</Link>
            </div>

            <div className="help-log-detail">
                <div className="help-log-header">
                    <h1>{helpLog.disasterId.type} Disaster Help</h1>
                    <span className={`status-badge ${getStatusBadgeClass(helpLog.status)}`}>
                        {helpLog.status.toUpperCase()}
                    </span>
                </div>

                <div className="help-log-info">
                    <div className="info-group">
                        <h3>Help Details</h3>
                        <p><strong>Location:</strong> {helpLog.location}</p>
                        <p><strong>Description:</strong> {helpLog.description}</p>
                        <p><strong>Food Packets Distributed:</strong> {helpLog.foodPacketsDistributed}</p>
                        <p><strong>Submitted On:</strong> {new Date(helpLog.createdAt).toLocaleString()}</p>
                        
                        {helpLog.status === 'verified' && (
                            <>
                                <p><strong>Verified By:</strong> {helpLog.verifiedBy?.name || 'Admin'}</p>
                                <p><strong>Verified On:</strong> {new Date(helpLog.verifiedAt).toLocaleString()}</p>
                                <p><strong>Points Earned:</strong> {helpLog.foodPacketsDistributed * 10}</p>
                            </>
                        )}
                        
                        {helpLog.status === 'rejected' && (
                            <>
                                <p><strong>Rejected By:</strong> {helpLog.verifiedBy?.name || 'Admin'}</p>
                                <p><strong>Rejected On:</strong> {new Date(helpLog.verifiedAt).toLocaleString()}</p>
                            </>
                        )}
                    </div>

                    <div className="info-group">
                        <h3>Disaster Information</h3>
                        <p><strong>Type:</strong> {helpLog.disasterId.type}</p>
                        <p><strong>Severity:</strong> {helpLog.disasterId.severity}</p>
                        <p><strong>Location:</strong> {helpLog.disasterId.location.city}, {helpLog.disasterId.location.state}</p>
                        <p><strong>Occurred On:</strong> {new Date(helpLog.disasterId.createdAt).toLocaleString()}</p>
                    </div>
                </div>

                <div className="photo-section">
                    <h3>Photos Provided ({helpLog.photos.length})</h3>
                    <div className="help-log-photos">
                        {helpLog.photos.map((photo, index) => (
                            <div key={index} className="help-log-photo" onClick={() => openPhotoModal(photo)}>
                                <img src={photo} alt={`Help proof ${index + 1}`} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

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

export default HelpLogDetail;