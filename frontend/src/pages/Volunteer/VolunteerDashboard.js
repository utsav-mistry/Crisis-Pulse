import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './VolunteerStyles.css';

const VolunteerDashboard = () => {
    const [helpLogs, setHelpLogs] = useState([]);
    const [activeDisasters, setActiveDisasters] = useState([]);
    const [activeTickets, setActiveTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userStats, setUserStats] = useState({
        totalHelps: 0,
        pointsEarned: 0,
        helpScoreDeductions: 0
    });
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect if not volunteer
        if (user && user.role !== 'volunteer') {
            navigate('/');
            toast.error('Unauthorized access');
            return;
        }

        // Fetch all required data
        const fetchData = async () => {
            try {
                // Fetch volunteer's help logs
                const logsResponse = await axios.get('/api/volunteer-help/my-help-logs');
                const logs = logsResponse.data.data;
                setHelpLogs(logs);

                // Extract active tickets (signed up or pending)
                const tickets = logs.filter(log =>
                    log.status === 'signed_up' ||
                    (log.status === 'pending' && log.isSignedUp)
                );
                setActiveTickets(tickets);

                // Calculate user stats
                const verifiedLogs = logs.filter(log => log.status === 'verified');
                const totalPoints = verifiedLogs.reduce((sum, log) => sum + (log.foodPacketsDistributed * 10), 0);

                setUserStats({
                    totalHelps: verifiedLogs.length,
                    pointsEarned: totalPoints,
                    helpScoreDeductions: user.helpScoreDeductions || 0
                });

                // Fetch active disasters
                const disastersResponse = await axios.get('/api/volunteer-help/active-disasters');
                setActiveDisasters(disastersResponse.data.data);

                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error(error.response?.data?.message || 'Failed to load your volunteer data');
                setLoading(false);
            }
        };

        if (user && user.role === 'volunteer') {
            fetchData();
        }
    }, [user, navigate]);

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'verified': return 'status-verified';
            case 'rejected': return 'status-rejected';
            case 'expired': return 'status-expired';
            case 'signed_up': return 'status-signed-up';
            default: return 'status-pending';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'signed_up': return 'SIGNED UP';
            case 'expired': return 'EXPIRED';
            default: return status.toUpperCase();
        }
    };

    return (
        <div className="volunteer-container">
            <h1>Volunteer Dashboard</h1>
            <p className="volunteer-description">
                Thank you for your service! Track your help logs and submit new ones here.
            </p>

            <div className="volunteer-stats">
                <div className="stat-card">
                    <h3>Help Stats</h3>
                    <p><strong>Total Helps:</strong> {userStats.totalHelps}</p>
                    <p><strong>Points Earned:</strong> {userStats.pointsEarned}</p>
                    <p className={userStats.helpScoreDeductions > 0 ? 'warning-text' : ''}>
                        <strong>Help Score Deductions:</strong> {userStats.helpScoreDeductions}/3
                        {userStats.helpScoreDeductions > 0 && (
                            <span className="deduction-warning">
                                {userStats.helpScoreDeductions >= 2 ? ' (Warning: One more deduction will result in a ban)' : ''}
                            </span>
                        )}
                    </p>
                </div>
            </div>

            <div className="volunteer-actions">
                <Link to="/volunteer/log-help" className="primary-button">
                    Log New Help
                </Link>
                {activeTickets.length === 0 && activeDisasters.length > 0 && (
                    <Link to="/volunteer/sign-up" className="secondary-button">
                        Sign Up to Help
                    </Link>
                )}
            </div>
            <div className="help-logs-list">
                {helpLogs.map((log) => (
                    <div key={log._id} className={`help-log-card ${log.status}`}>
                        <div className="help-log-header">
                            <h3>{log.disasterId.type} Disaster Help</h3>
                            <span className={`status-badge ${getStatusBadgeClass(log.status)}`}>
                                {getStatusText(log.status)}
                            </span>
                        </div>
                        <div className="help-log-details">
                            <p><strong>Location:</strong> {log.location}</p>
                            <p><strong>Food Packets:</strong> {log.foodPacketsDistributed}</p>
                            <p><strong>Submitted:</strong> {new Date(log.createdAt).toLocaleString()}</p>
                            {log.status === 'verified' && (
                                <p><strong>Points Earned:</strong> {log.foodPacketsDistributed * 10}</p>
                            )}
                        </div>
                        <div className="help-log-actions">
                            <Link to="/volunteer/log-help" className="complete-help-button">
                                Complete Help Now
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

<h2>Your Help Logs</h2>

{
    loading ? (
        <div className="loading-spinner">Loading...</div>
    ) : helpLogs.length === 0 ? (
        <div className="no-data-message">
            <p>You haven't logged any help yet. Start by logging your first help!</p>
        </div>
    ) : (
        <div className="help-logs-list">
            {helpLogs.map((log) => (
                <div key={log._id} className={`help-log-card ${log.status}`}>
                    <div className="help-log-header">
                        <h3>{log.disasterId.type} Disaster Help</h3>
                        <span className={`status-badge ${getStatusBadgeClass(log.status)}`}>
                            {getStatusText(log.status)}
                        </span>
                    </div>
                    <div className="help-log-details">
                        <p><strong>Location:</strong> {log.location}</p>
                        <p><strong>Food Packets:</strong> {log.foodPacketsDistributed}</p>
                        <p><strong>Submitted:</strong> {new Date(log.createdAt).toLocaleString()}</p>
                        {log.status === 'verified' && (
                            <p><strong>Points Earned:</strong> {log.foodPacketsDistributed * 10}</p>
                        )}
                    </div>
                    <div className="help-log-actions">
                        <Link to={`/volunteer/help-log/${log._id}`} className="view-details-button">
                            View Details
                        </Link>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default VolunteerDashboard;