import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './VolunteerStyles.css';

const LogHelp = () => {
    const [disasters, setDisasters] = useState([]);
    const [formData, setFormData] = useState({
        disasterId: '',
        location: '',
        description: '',
        foodPacketsDistributed: 1
    });
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const fileInputRef = useRef(null);
    
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect if not volunteer
        if (user && user.role !== 'volunteer') {
            navigate('/dashboard');
            return;
        }

        // Fetch active disasters
        const fetchDisasters = async () => {
            try {
                const response = await axios.get('/api/disasters');
                setDisasters(response.data.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching disasters:', error);
                toast.error('Failed to load disasters');
                setLoading(false);
            }
        };

        if (user && user.role === 'volunteer') {
            fetchDisasters();
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'foodPacketsDistributed' ? parseInt(value) : value
        }));
    };

    const handlePhotoChange = (e) => {
        const files = Array.from(e.target.files);
        
        if (photos.length + files.length > 10) {
            toast.error('You can upload a maximum of 10 photos');
            return;
        }

        // Convert files to base64
        files.forEach(file => {
            if (!file.type.match('image.*')) {
                toast.error(`${file.name} is not an image file`);
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                setPhotos(prev => [...prev, {
                    file,
                    preview: e.target.result,
                    name: file.name
                }]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removePhoto = (index) => {
        setPhotos(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (photos.length < 5) {
            toast.error('Please upload at least 5 photos as proof of help');
            return;
        }

        setSubmitting(true);

        try {
            // First upload all photos and get URLs
            const photoUrls = await Promise.all(photos.map(async (photo) => {
                const formData = new FormData();
                formData.append('file', photo.file);
                formData.append('upload_preset', 'crisis_pulse'); // Replace with your Cloudinary upload preset
                
                // This is a mock implementation - in a real app, you'd use your actual image upload service
                // For example, with Cloudinary:
                // const response = await axios.post('https://api.cloudinary.com/v1_1/your-cloud-name/image/upload', formData);
                // return response.data.secure_url;
                
                // For this demo, we'll just return the base64 as a placeholder
                return photo.preview;
            }));

            // Then submit the help log with photo URLs
            await axios.post('/api/volunteer-help', {
                ...formData,
                photos: photoUrls
            });

            toast.success('Help log submitted successfully! It will be verified by an admin.');
            navigate('/volunteer/dashboard');
        } catch (error) {
            console.error('Error submitting help log:', error);
            toast.error(error.response?.data?.message || 'Failed to submit help log');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="volunteer-container">
            <h1>Log Your Help</h1>
            <p className="volunteer-description">
                Thank you for your service! Please provide details about the help you've provided.
            </p>

            {loading ? (
                <div className="loading-spinner">Loading...</div>
            ) : (
                <form className="help-log-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="disasterId">Disaster</label>
                        <select 
                            id="disasterId" 
                            name="disasterId" 
                            className="form-control"
                            value={formData.disasterId}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select a disaster</option>
                            {disasters.map(disaster => (
                                <option key={disaster._id} value={disaster._id}>
                                    {disaster.type} - {disaster.location.city}, {disaster.location.state}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="location">Specific Location Where You Helped</label>
                        <input 
                            type="text" 
                            id="location" 
                            name="location" 
                            className="form-control"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="e.g., Gandhi Nagar, Sector 5"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description of Help Provided</label>
                        <textarea 
                            id="description" 
                            name="description" 
                            className="form-control"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Describe how you helped the affected people"
                            required
                        ></textarea>
                    </div>

                    <div className="form-group">
                        <label htmlFor="foodPacketsDistributed">Number of Food Packets Distributed</label>
                        <input 
                            type="number" 
                            id="foodPacketsDistributed" 
                            name="foodPacketsDistributed" 
                            className="form-control"
                            value={formData.foodPacketsDistributed}
                            onChange={handleChange}
                            min="1"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Photos as Proof (Minimum 5 required)</label>
                        <div className="photo-upload-container">
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                onChange={handlePhotoChange}
                                accept="image/*"
                                multiple
                                style={{ display: 'none' }}
                            />
                            <div className="photo-preview">
                                {photos.map((photo, index) => (
                                    <div key={index} className="photo-item">
                                        <img src={photo.preview} alt={`Preview ${index}`} />
                                        <button 
                                            type="button" 
                                            className="remove-photo"
                                            onClick={() => removePhoto(index)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button 
                                type="button" 
                                className="photo-upload-button"
                                onClick={() => fileInputRef.current.click()}
                            >
                                Upload Photos
                            </button>
                            <p className="photo-requirement">
                                {photos.length < 5 
                                    ? `Please upload at least ${5 - photos.length} more photo${5 - photos.length !== 1 ? 's' : ''}` 
                                    : 'Minimum photo requirement met'}
                            </p>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="submit-button"
                        disabled={submitting || photos.length < 5}
                    >
                        {submitting ? 'Submitting...' : 'Submit Help Log'}
                    </button>
                </form>
            )}
        </div>
    );
};

export default LogHelp;