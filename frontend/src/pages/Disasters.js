import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { MapPin, AlertTriangle, Calendar, User, Activity, Plus, Shield, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import DisasterCard from '../components/DisasterCard';

const Disasters = () => {
    const { user } = useAuth();
    const [disasters, setDisasters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [showReportForm, setShowReportForm] = useState(false);
    const [reportForm, setReportForm] = useState({
        type: '',
        location: { city: '', state: '' },
        severity: 'medium',
        message: ''
    });

    useEffect(() => {
        fetchDisasters();
    }, []);

    const fetchDisasters = async () => {
        try {
            const response = await fetch('/api/disasters');
            if (response.ok) {
                const data = await response.json();
                setDisasters(data.map(disaster => ({
                    ...disaster,
                    id: disaster._id,
                    timestamp: new Date(disaster.createdAt || disaster.predictionDate)
                })));
            }
        } catch (error) {
            console.error('Error fetching disasters:', error);
        }
        setLoading(false);
    };

    const handleReportSubmit = async (e) => {
        e.preventDefault();
        try {
            const disasterData = {
                ...reportForm,
                source: 'manual',
                raisedBy: user?._id
            };
            const response = await axios.post('/api/disasters/raise', disasterData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    ...reportForm,
                    source: 'manual',
                    raisedBy: user?._id
                })
            });

            if (response.ok) {
                const newDisaster = await response.json();
                setDisasters(prev => [newDisaster, ...prev]);
                setShowReportForm(false);
                setReportForm({ type: '', location: { city: '', state: '' }, severity: 'medium', message: '' });
                toast.success('Disaster report submitted successfully!');
            } else {
                const error = await response.json();
                toast.error(error.message || 'Failed to submit disaster report');
            }
        } catch (error) {
            console.error('Error submitting disaster report:', error);
            toast.error('Failed to submit disaster report');
        }
    };

    const filteredDisasters = disasters.filter(disaster => {
        if (filter === 'all') return true;
        if (filter === 'high') return disaster.severity === 'high';
        if (filter === 'recent') return new Date() - disaster.timestamp < 24 * 60 * 60 * 1000;
        if (filter === 'active') return disaster.status !== 'resolved';
        return true;
    });

    const getSeverityStats = () => {
        return {
            total: disasters.length,
            high: disasters.filter(d => d.severity === 'high').length,
            medium: disasters.filter(d => d.severity === 'medium').length,
            low: disasters.filter(d => d.severity === 'low').length
        };
    };

    const stats = getSeverityStats();

    if (showReportForm) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900">Report Disaster</h1>
                        <p className="text-neutral-600">Report an emergency or disaster situation</p>
                    </div>
                    <button 
                        onClick={() => setShowReportForm(false)}
                        className="btn btn-outline"
                    >
                        Back to List
                    </button>
                </div>

                <div className="card max-w-2xl">
                    <div className="card-body">
                        <form onSubmit={handleReportSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                                        Disaster Type
                                    </label>
                                    <select
                                        value={reportForm.type}
                                        onChange={(e) => setReportForm(prev => ({ ...prev, type: e.target.value }))}
                                        className="input"
                                        required
                                    >
                                        <option value="">Select disaster type</option>
                                        <option value="flood">Flood</option>
                                        <option value="earthquake">Earthquake</option>
                                        <option value="cyclone">Cyclone</option>
                                        <option value="drought">Drought</option>
                                        <option value="wildfire">Wildfire</option>
                                        <option value="landslide">Landslide</option>
                                        <option value="tsunami">Tsunami</option>
                                        <option value="heatwave">Heatwave</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                                        Severity
                                    </label>
                                    <select
                                        value={reportForm.severity}
                                        onChange={(e) => setReportForm(prev => ({ ...prev, severity: e.target.value }))}
                                        className="input"
                                        required
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        value={reportForm.location.city}
                                        onChange={(e) => setReportForm(prev => ({ 
                                            ...prev, 
                                            location: { ...prev.location, city: e.target.value }
                                        }))}
                                        className="input"
                                        placeholder="Enter city name"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                                        State
                                    </label>
                                    <input
                                        type="text"
                                        value={reportForm.location.state}
                                        onChange={(e) => setReportForm(prev => ({ 
                                            ...prev, 
                                            location: { ...prev.location, state: e.target.value }
                                        }))}
                                        className="input"
                                        placeholder="Enter state name"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={reportForm.message}
                                    onChange={(e) => setReportForm(prev => ({ ...prev, message: e.target.value }))}
                                    className="input"
                                    rows="4"
                                    placeholder="Describe the disaster situation in detail..."
                                    required
                                />
                            </div>

                            <div className="flex space-x-3">
                                <button type="submit" className="btn btn-emergency flex-1">
                                    <AlertTriangle className="w-4 h-4 mr-2" />
                                    Submit Report
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setShowReportForm(false)}
                                    className="btn btn-outline"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 flex items-center">
                        <Activity className="w-6 h-6 mr-2 text-emergency-600" />
                        Active Disasters
                    </h1>
                    <p className="text-neutral-600">Monitor and respond to disaster situations</p>
                </div>
                <button 
                    onClick={() => setShowReportForm(true)}
                    className="btn btn-emergency"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Report Emergency
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card">
                    <div className="card-body text-center">
                        <AlertTriangle className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-neutral-900">{stats.total}</div>
                        <p className="text-sm text-neutral-600">Total Disasters</p>
                    </div>
                </div>
                <div className="card">
                    <div className="card-body text-center">
                        <AlertTriangle className="w-8 h-8 text-emergency-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-emergency-600">{stats.high}</div>
                        <p className="text-sm text-neutral-600">High Severity</p>
                    </div>
                </div>
                <div className="card">
                    <div className="card-body text-center">
                        <AlertTriangle className="w-8 h-8 text-warning-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-warning-600">{stats.medium}</div>
                        <p className="text-sm text-neutral-600">Medium Severity</p>
                    </div>
                </div>
                <div className="card">
                    <div className="card-body text-center">
                        <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-blue-600">
                            {disasters.filter(d => d.severity === 'high').length}
                        </div>
                        <p className="text-sm text-neutral-600">CRPF Notified</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card">
                <div className="card-body">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Filter className="w-4 h-4 text-neutral-500" />
                            <span className="text-sm font-medium text-neutral-700">Filter:</span>
                        </div>
                        <div className="flex space-x-2">
                            {[
                                { key: 'all', label: 'All', count: disasters.length },
                                { key: 'high', label: 'High Severity', count: stats.high },
                                { key: 'recent', label: 'Recent (24h)', count: disasters.filter(d => new Date() - d.timestamp < 24 * 60 * 60 * 1000).length },
                                { key: 'active', label: 'Active', count: disasters.filter(d => d.status !== 'resolved').length }
                            ].map(filterOption => (
                                <button
                                    key={filterOption.key}
                                    onClick={() => setFilter(filterOption.key)}
                                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                                        filter === filterOption.key
                                            ? 'bg-primary-100 text-primary-700 border border-primary-200'
                                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                    }`}
                                >
                                    {filterOption.label} ({filterOption.count})
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Disasters List */}
            <div className="card">
                <div className="card-header">
                    <h3 className="text-lg font-semibold text-neutral-900">
                        Disaster Reports ({filteredDisasters.length})
                    </h3>
                </div>
                <div className="card-body">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                            <span className="ml-3 text-neutral-600">Loading disasters...</span>
                        </div>
                    ) : filteredDisasters.length === 0 ? (
                        <div className="text-center py-8">
                            <AlertTriangle className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-neutral-900 mb-2">No Disasters Found</h3>
                            <p className="text-neutral-600 mb-4">
                                {filter === 'all' 
                                    ? 'No disasters have been reported yet.' 
                                    : 'No disasters match the current filter.'
                                }
                            </p>
                            <button 
                                onClick={() => setShowReportForm(true)}
                                className="btn btn-emergency"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Report First Emergency
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredDisasters.map((disaster) => (
                                <DisasterCard 
                                    key={disaster.id} 
                                    disaster={disaster}
                                    showActions={user?.role === 'admin'}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Disasters;