import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { disasterAPI } from '../../services/api';
import toast from 'react-hot-toast';

const TestDisaster = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    // Redirect if not admin
    React.useEffect(() => {
        if (user && user.role !== 'admin') {
            navigate('/');
            toast.error('Unauthorized access');
        }
    }, [user, navigate]);

    const disasterTypes = [
        { id: 'flood', name: 'Flood', color: 'blue' },
        { id: 'earthquake', name: 'Earthquake', color: 'orange' },
        { id: 'cyclone', name: 'Cyclone', color: 'teal' },
        { id: 'drought', name: 'Drought', color: 'yellow' },
        { id: 'wildfire', name: 'Wildfire', color: 'red' },
        { id: 'landslide', name: 'Landslide', color: 'brown' },
        { id: 'tsunami', name: 'Tsunami', color: 'indigo' },
        { id: 'heatwave', name: 'Heatwave', color: 'amber' },
    ];

    const severityLevels = [
        { id: 'low', name: 'Low', color: 'green' },
        { id: 'medium', name: 'Medium', color: 'yellow' },
        { id: 'high', name: 'High', color: 'red' },
    ];

    const handleRaiseTestDisaster = async (type, severity) => {
        try {
            setLoading(true);
            
            // Create test disaster data
            const disasterData = {
                type,
                severity,
                location: {
                    city: 'Test City',
                    state: 'Test State',
                    coordinates: {
                        lat: 20.5937,
                        lon: 78.9629
                    }
                },
                source: 'manual',
                predictionDate: new Date(),
                raisedBy: user.id,
                message: `Test ${severity} ${type} disaster in Test City, Test State. This is a test alert.`
            };
            
            // Call API to create disaster
            await disasterAPI.create(disasterData);
            
            toast.success(`Test ${type} disaster raised successfully!`);
        } catch (error) {
            console.error('Error raising test disaster:', error);
            toast.error(error.response?.data?.message || 'Failed to raise test disaster');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Test Disaster Panel</h1>
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Raise Test Disaster</h2>
                <p className="text-gray-600 mb-6">
                    Use these buttons to simulate disaster alerts for testing purposes. 
                    These will trigger real notifications but will be marked as test alerts.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {disasterTypes.map((disaster) => (
                        <div key={disaster.id} className="border rounded-lg p-4 bg-gray-50">
                            <h3 className="font-medium text-lg mb-3">{disaster.name}</h3>
                            <div className="flex flex-col space-y-2">
                                {severityLevels.map((severity) => (
                                    <button
                                        key={`${disaster.id}-${severity.id}`}
                                        onClick={() => handleRaiseTestDisaster(disaster.id, severity.id)}
                                        disabled={loading}
                                        className={`py-2 px-4 rounded-md text-white font-medium transition-all
                                            ${severity.id === 'low' ? 'bg-green-500 hover:bg-green-600' : ''}
                                            ${severity.id === 'medium' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
                                            ${severity.id === 'high' ? 'bg-red-500 hover:bg-red-600' : ''}
                                            ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                                        `}
                                    >
                                        {severity.name} {disaster.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-medium text-yellow-800">Important Note</h3>
                <p className="text-yellow-700 text-sm mt-1">
                    These test alerts will be sent to all connected users. Use responsibly.
                </p>
            </div>
        </div>
    );
};

export default TestDisaster;