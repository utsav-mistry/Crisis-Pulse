import React, { useState, useEffect } from 'react';
import { 
    AlertTriangle, 
    MapPin, 
    Clock, 
    Activity,
    Zap,
    TrendingUp
} from 'lucide-react';
import { aiAPI } from '../services/api';

const DisasterFeed = () => {
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLivePredictions = async () => {
            try {
                // Start the live feed if not already running
                await aiAPI.startLiveFeed().catch(err => {
                    console.log('Live feed already running or failed to start:', err.response?.data?.message);
                });
                
                // Get live predictions from the queue
                const response = await aiAPI.getLivePredictions();
                const data = response.data;
                
                console.log('Live Predictions Response:', data);
                
                const livePredictions = data.live_predictions || [];
                console.log('Live Predictions from AI Model:', livePredictions);
                
                if (livePredictions && livePredictions.length > 0) {
                    const confidenceToNumeric = (val) => {
                        if (typeof val === 'number') return val;
                        if (!val) return undefined;
                        const s = String(val).toLowerCase();
                        if (s === 'low') return 0.3;
                        if (s === 'medium' || s === 'moderate') return 0.6;
                        if (s === 'high' || s === 'critical') return 0.9;
                        const n = Number(val);
                        return isNaN(n) ? undefined : n;
                    };

                    const formattedPredictions = livePredictions.map((p, i) => {
                        // Handle the live prediction format from your AI model console output
                        const accuracyCandidate = p.accuracy || confidenceToNumeric(p.confidence) || confidenceToNumeric(p.risk_level);
                        const accuracy = typeof accuracyCandidate === 'number' && !isNaN(accuracyCandidate)
                            ? Math.max(0, Math.min(1, accuracyCandidate))
                            : undefined;

                        return ({
                            id: `live-${Date.now()}-${i}`,
                            type: (p.disaster || p.type || 'Unknown').toLowerCase(),
                            severity: (p.risk_level || p.severity || 'low').toLowerCase(),
                            location: p.location || 'Unknown Location',
                            timestamp: new Date(p.timestamp || Date.now()),
                            accuracy: accuracy,
                            probability: typeof p.probability === 'number' ? p.probability : undefined,
                            model_used: 'live_ai_model'
                        });
                    });
                    setPredictions(formattedPredictions);
                }
                setError(null);
            } catch (error) {
                console.error('Error fetching live predictions:', error);
                setError(`Failed to connect to AI service: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchLivePredictions(); // Initial fetch
        const intervalId = setInterval(fetchLivePredictions, 5000); // Poll every 5 seconds for real-time updates

        return () => clearInterval(intervalId); // Cleanup on component unmount
    }, []);

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

    const formatTimeAgo = (timestamp) => {
        const now = new Date();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(diff / 3600000);
        if (hours < 24) return `${hours}h ago`;
        return timestamp.toLocaleDateString();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 flex items-center">
                        <Activity className="w-6 h-6 mr-2 text-primary-600" />
                        Live AI Disaster Feed
                    </h1>
                    <p className="text-neutral-600">
                        Real-time disaster predictions from the AI model
                    </p>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h3 className="text-lg font-semibold text-neutral-900">
                        AI Predictions ({predictions.length})
                    </h3>
                </div>
                <div className="card-body">
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                            <p className="mt-3 text-neutral-600">Loading initial predictions...</p>
                        </div>
                    ) : error ? (
                         <div className="text-center py-8">
                            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                            <p className="text-red-600 font-medium">{error}</p>
                            <p className="text-neutral-500 text-sm mt-2">Please ensure the AI service is running on port 8000.</p>
                        </div>
                    ) : predictions.length === 0 ? (
                        <div className="text-center py-8">
                            <Zap className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                            <p className="text-neutral-600">No active disaster predictions from the AI model.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {predictions.map((prediction) => (
                                <div key={prediction.id} className="p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-4">
                                            <div className="text-3xl mt-1">
                                                {getDisasterIcon(prediction.type)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <h4 className="font-semibold text-neutral-900 capitalize text-lg">
                                                        {prediction.type} Alert
                                                    </h4>
                                                    <span className={`badge ${getSeverityColor(prediction.severity)}`}>
                                                        {prediction.severity} risk
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-600">
                                                    <div className="flex items-center space-x-1.5">
                                                        <MapPin className="w-4 h-4" />
                                                        <span>{typeof prediction.location === 'object' ? 
                                                            `${prediction.location.city || ''}, ${prediction.location.state || ''}`.replace(/^, |, $/, '') : 
                                                            prediction.location || 'Unknown Location'}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1.5">
                                                        <Clock className="w-4 h-4" />
                                                        <span>{formatTimeAgo(prediction.timestamp)}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1.5">
                                                        <TrendingUp className="w-4 h-4" />
                                                        <span>
                                                            Accuracy: {typeof prediction.accuracy === 'number' && !isNaN(prediction.accuracy)
                                                                ? `${(prediction.accuracy * 100).toFixed(2)}%`
                                                                : 'N/A'}
                                                        </span>
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
        </div>
    );
};

export default DisasterFeed;
