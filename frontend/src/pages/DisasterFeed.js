import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { 
    AlertTriangle, 
    MapPin, 
    Clock, 
    Shield, 
    Users,
    Activity,
    Filter,
    RefreshCw,
    Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

const DisasterFeed = () => {
    const { user } = useAuth();
    const { socket, isConnected } = useSocket();
    const [disasters, setDisasters] = useState([]);
    const [crpfNotifications, setCrpfNotifications] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    // Fetch real disasters from API
    useEffect(() => {
        const fetchDisasters = async () => {
            try {
                const response = await fetch('/api/disasters');
                if (response.ok) {
                    const data = await response.json();
                    setDisasters(data.map(disaster => ({
                        ...disaster,
                        id: disaster._id,
                        timestamp: new Date(disaster.createdAt || disaster.predictionDate),
                        crpfNotified: disaster.severity === 'high'
                    })));
                }
            } catch (error) {
                console.error('Error fetching disasters:', error);
                // Keep empty array on error
                setDisasters([]);
            }
            setLoading(false);
        };

        const fetchCrpfNotifications = async () => {
            try {
                const response = await fetch('/api/crpf-notifications');
                if (response.ok) {
                    const data = await response.json();
                    setCrpfNotifications(data.map(notification => ({
                        ...notification,
                        id: notification._id,
                        timestamp: new Date(notification.createdAt)
                    })));
                }
            } catch (error) {
                console.error('Error fetching CRPF notifications:', error);
                setCrpfNotifications([]);
            }
        };

        fetchDisasters();
        fetchCrpfNotifications();
    }, []);

    // Listen for real-time updates
    useEffect(() => {
        if (!socket) return;

        const handleNewDisaster = (data) => {
            setDisasters(prev => [{ ...data, timestamp: new Date() }, ...prev]);
            toast.custom((t) => (
                <div className="max-w-md w-full bg-white shadow-lg rounded-lg border-l-4 border-emergency-500">
                    <div className="p-4">
                        <div className="flex items-start">
                            <AlertTriangle className="w-5 h-5 text-emergency-600 mt-0.5" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">New Disaster Alert</p>
                                <p className="text-sm text-gray-600">{data.message}</p>
                            </div>
                        </div>
                    </div>
                </div>
            ), { duration: 6000 });
        };

        const handleCrpfNotification = (data) => {
            setCrpfNotifications(prev => [{ ...data, timestamp: new Date() }, ...prev]);
            toast.custom((t) => (
                <div className="max-w-md w-full bg-white shadow-lg rounded-lg border-l-4 border-blue-500">
                    <div className="p-4">
                        <div className="flex items-start">
                            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">CRPF Response</p>
                                <p className="text-sm text-gray-600">{data.message}</p>
                            </div>
                        </div>
                    </div>
                </div>
            ), { duration: 8000 });
        };

        socket.on('new_disaster_alert', handleNewDisaster);
        socket.on('crpf_notification', handleCrpfNotification);

        return () => {
            socket.off('new_disaster_alert', handleNewDisaster);
            socket.off('crpf_notification', handleCrpfNotification);
        };
    }, [socket]);

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'high': return 'text-emergency-600 bg-emergency-50 border-emergency-200';
            case 'medium': return 'text-warning-600 bg-warning-50 border-warning-200';
            case 'low': return 'text-safety-600 bg-safety-50 border-safety-200';
            default: return 'text-neutral-600 bg-neutral-50 border-neutral-200';
        }
    };

    const getDisasterIcon = (type) => {
        const icons = {
            flood: '🌊',
            earthquake: '🏔️',
            cyclone: '🌀',
            drought: '☀️',
            wildfire: '🔥',
            landslide: '⛰️',
            tsunami: '🌊',
            heatwave: '🌡️'
        };
        return icons[type] || '⚠️';
    };

    const filteredDisasters = disasters.filter(disaster => {
        if (filter === 'all') return true;
        if (filter === 'high') return disaster.severity === 'high';
        if (filter === 'crpf') return disaster.crpfNotified;
        return true;
    });

    const formatTimeAgo = (timestamp) => {
        const now = new Date();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return timestamp.toLocaleDateString();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 flex items-center">
                        <Activity className="w-6 h-6 mr-2 text-primary-600" />
                        Live Disaster Feed
                    </h1>
                    <p className="text-neutral-600">
                        Real-time disaster alerts and CRPF response updates
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                        isConnected ? 'bg-safety-50 text-safety-700' : 'bg-neutral-100 text-neutral-600'
                    }`}>
                        <div className={`w-2 h-2 rounded-full ${
                            isConnected ? 'bg-safety-500' : 'bg-neutral-400'
                        }`}></div>
                        <span className="text-sm font-medium">
                            {isConnected ? 'Live' : 'Offline'}
                        </span>
                    </div>
                    <button 
                        onClick={() => window.location.reload()}
                        className="btn btn-outline btn-sm"
                    >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Refresh
                    </button>
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
                                { key: 'all', label: 'All Alerts', count: disasters.length },
                                { key: 'high', label: 'High Severity', count: disasters.filter(d => d.severity === 'high').length },
                                { key: 'crpf', label: 'CRPF Notified', count: disasters.filter(d => d.crpfNotified).length }
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

            {/* CRPF Notifications Section */}
            {crpfNotifications.length > 0 && (
                <div className="card">
                    <div className="card-header">
                        <h3 className="text-lg font-semibold text-neutral-900 flex items-center">
                            <Shield className="w-5 h-5 mr-2 text-blue-600" />
                            CRPF Response Updates
                        </h3>
                    </div>
                    <div className="card-body">
                        <div className="space-y-3">
                            {crpfNotifications.slice(0, 3).map((notification) => (
                                <div key={notification.id} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <p className="text-sm text-blue-800 font-medium">
                                                {notification.message}
                                            </p>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {notification.crpfUnits.map((unit, index) => (
                                                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                                        {unit}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="text-right ml-4">
                                            <span className="text-xs text-blue-600">
                                                {formatTimeAgo(notification.timestamp)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Disaster Feed */}
            <div className="card">
                <div className="card-header">
                    <h3 className="text-lg font-semibold text-neutral-900">
                        Disaster Alerts ({filteredDisasters.length})
                    </h3>
                </div>
                <div className="card-body">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                            <span className="ml-3 text-neutral-600">Loading feed...</span>
                        </div>
                    ) : filteredDisasters.length === 0 ? (
                        <div className="text-center py-8">
                            <AlertTriangle className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                            <p className="text-neutral-600">No disasters match the current filter</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredDisasters.map((disaster) => (
                                <div key={disaster.id} className="p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-4">
                                            <div className="text-2xl">
                                                {getDisasterIcon(disaster.type)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <h4 className="font-medium text-neutral-900 capitalize">
                                                        {disaster.type} Alert
                                                    </h4>
                                                    <span className={`badge ${getSeverityColor(disaster.severity)}`}>
                                                        {disaster.severity}
                                                    </span>
                                                    {disaster.crpfNotified && (
                                                        <span className="badge bg-blue-50 text-blue-700 border-blue-200">
                                                            <Shield className="w-3 h-3 mr-1" />
                                                            CRPF Notified
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-neutral-700 mb-2">
                                                    {disaster.message}
                                                </p>
                                                <div className="flex items-center space-x-4 text-xs text-neutral-500">
                                                    <div className="flex items-center space-x-1">
                                                        <MapPin className="w-3 h-3" />
                                                        <span>{disaster.location.city}, {disaster.location.state}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <Clock className="w-3 h-3" />
                                                        <span>{formatTimeAgo(disaster.timestamp)}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <Zap className="w-3 h-3" />
                                                        <span className="capitalize">{disaster.source}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card">
                    <div className="card-body text-center">
                        <div className="text-2xl font-bold text-emergency-600">
                            {disasters.filter(d => d.severity === 'high').length}
                        </div>
                        <p className="text-sm text-neutral-600">High Severity</p>
                    </div>
                </div>
                <div className="card">
                    <div className="card-body text-center">
                        <div className="text-2xl font-bold text-warning-600">
                            {disasters.filter(d => d.severity === 'medium').length}
                        </div>
                        <p className="text-sm text-neutral-600">Medium Severity</p>
                    </div>
                </div>
                <div className="card">
                    <div className="card-body text-center">
                        <div className="text-2xl font-bold text-blue-600">
                            {disasters.filter(d => d.crpfNotified).length}
                        </div>
                        <p className="text-sm text-neutral-600">CRPF Notified</p>
                    </div>
                </div>
                <div className="card">
                    <div className="card-body text-center">
                        <div className="text-2xl font-bold text-primary-600">
                            {disasters.filter(d => d.source === 'ai').length}
                        </div>
                        <p className="text-sm text-neutral-600">AI Predicted</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DisasterFeed;
