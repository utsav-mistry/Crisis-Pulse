import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './VolunteerStyles.css';

const SignUpForHelp = () => {
    const [activeDisasters, setActiveDisasters] = useState([]);
    const [selectedDisaster, setSelectedDisaster] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect if not volunteer
        if (user && user.role !== 'volunteer') {
            navigate('/');
            toast.error('Unauthorized access');
            return;
        }

        // Fetch active disasters that need help
        const fetchActiveDisasters = async () => {
            try {
                const response = await axios.get('/api/volunteer-help/active-disasters');
                setActiveDisasters(response.data.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching active disasters:', error);
                setError(error.response?.data?.message || 'Failed to load active disasters');
                setLoading(false);
            }
        };

        if (user && user.role === 'volunteer') {
            fetchActiveDisasters();
        }
    }, [user, navigate]);

    const handleDisasterChange = (e) => {
        setSelectedDisaster(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedDisaster) {
            toast.error('Please select a disaster to help with');
            return;
        }

        setSubmitting(true);

        try {
            const response = await axios.post('/api/volunteer-help/sign-up', {
                disasterId: selectedDisaster
            });

            toast.success(response.data.message || 'Successfully signed up for help!');
            navigate('/volunteer');
        } catch (error) {
            console.error('Error signing up for help:', error);
            toast.error(error.response?.data?.message || 'Failed to sign up for help');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="volunteer-container loading-spinner">Loading...</div>;
    }

    if (error) {
        return (
            <div className="volunteer-container error-container">
                <h1>Error</h1>
                <p>{error}</p>
                <button 
                    className="primary-button"
                    onClick={() => navigate('/volunteer')}
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="volunteer-container">
            <h1>Sign Up to Help</h1>
            <p className="volunteer-description">
                Thank you for your willingness to help! By signing up, you commit to providing help within 3 days.
                <strong> Important:</strong> Failure to complete your help within 3 days will result in a help score deduction.
                Three deductions will result in a ban from the volunteer program.
            </p>

            {activeDisasters.length === 0 ? (
                <div className="no-disasters-message">
                    <p>There are no active disasters that need volunteer help at this time.</p>
                    <button 
                        className="primary-button"
                        onClick={() => navigate('/volunteer')}
                    >
                        Back to Dashboard
                    </button>
                </div>
            ) : (
                <form className="help-signup-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="disasterId">Select Disaster to Help With</label>
                        <select 
                            id="disasterId" 
                            name="disasterId" 
                            className="form-control"
                            value={selectedDisaster}
                            onChange={handleDisasterChange}
                            required
                        >
                            <option value="">Select a disaster</option>
                            {activeDisasters.map(disaster => (
                                <option key={disaster._id} value={disaster._id}>
                                    {disaster.type} - {disaster.location.city}, {disaster.location.state}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="commitment-box">
                        <h3>Your Commitment</h3>
                        <ul>
                            <li>Provide help within 3 days of signing up</li>
                            <li>Distribute food packets to affected people</li>
                            <li>Take at least 5 photos as proof of your help</li>
                            <li>Submit a complete help log after providing assistance</li>
                        </ul>
                    </div>

                    <div className="warning-box">
                        <h3>Warning</h3>
                        <p>
                            If you sign up but fail to complete your help within 3 days, you will receive a help score deduction.
                            Three deductions will result in being banned from the volunteer program.
                        </p>
                    </div>

                    <div className="form-actions">
                        <button 
                            type="button" 
                            className="secondary-button"
                            onClick={() => navigate('/volunteer')}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="primary-button"
                            disabled={submitting || !selectedDisaster}
                        >
                            {submitting ? 'Signing Up...' : 'Sign Up to Help'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default SignUpForHelp;