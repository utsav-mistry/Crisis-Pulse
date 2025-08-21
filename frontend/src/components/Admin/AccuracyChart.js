import React, { useState, useEffect } from 'react';
import { TrendingUp, Activity, Target, BarChart3, RefreshCw } from 'lucide-react';
import { aiAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AccuracyChart = () => {
    const [accuracyData, setAccuracyData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        averageAccuracy: 0,
        totalPredictions: 0,
        highAccuracyCount: 0,
        trend: 'stable'
    });

    useEffect(() => {
        fetchAccuracyData();
        // Refresh data every 30 seconds
        const interval = setInterval(fetchAccuracyData, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchAccuracyData = async () => {
        try {
            setLoading(true);
            // Fetch predictions to get accuracy data
            const response = await aiAPI.predictDisaster({
                location: { city: 'Global', state: 'Worldwide' },
                disaster_type: 'all'
            });

            if (response.data) {
                const predictions = response.data.predictions || response.data.live_predictions || [];
                
                // Process accuracy data
                const processedData = predictions.map((prediction, index) => ({
                    id: index + 1,
                    timestamp: new Date(prediction.timestamp || prediction.created_at || Date.now()),
                    accuracy: (prediction.accuracy || prediction.confidence || prediction.probability || 0.5) * 100,
                    type: prediction.type || prediction.disaster || 'unknown',
                    severity: prediction.severity || prediction.risk_level || 'medium'
                }));

                setAccuracyData(processedData);

                // Calculate stats
                const totalPredictions = processedData.length;
                const averageAccuracy = totalPredictions > 0 
                    ? processedData.reduce((sum, item) => sum + item.accuracy, 0) / totalPredictions 
                    : 0;
                const highAccuracyCount = processedData.filter(item => item.accuracy >= 80).length;

                setStats({
                    averageAccuracy: Math.round(averageAccuracy * 100) / 100,
                    totalPredictions,
                    highAccuracyCount,
                    trend: averageAccuracy >= 75 ? 'up' : averageAccuracy >= 60 ? 'stable' : 'down'
                });
            }
        } catch (error) {
            console.error('Error fetching accuracy data:', error);
            toast.error('Failed to fetch accuracy data from AI service');
        } finally {
            setLoading(false);
        }
    };

    const getAccuracyColor = (accuracy) => {
        if (accuracy >= 80) return 'text-green-600 bg-green-50 border-green-200';
        if (accuracy >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    const getAccuracyBarWidth = (accuracy) => {
        return Math.max(5, accuracy); // Minimum 5% width for visibility
    };

    const getTrendIcon = () => {
        switch (stats.trend) {
            case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
            case 'down': return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
            default: return <Activity className="w-4 h-4 text-blue-500" />;
        }
    };

    return (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm">
            <div className="flex items-center justify-between p-6 border-b border-neutral-100">
                <div>
                    <h3 className="text-lg font-semibold text-neutral-900 flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2 text-purple-500" />
                        AI Prediction Accuracy
                    </h3>
                    <p className="text-sm text-neutral-600 mt-1">
                        Real-time accuracy metrics from Django AI service
                    </p>
                </div>
                <button
                    onClick={fetchAccuracyData}
                    disabled={loading}
                    className="btn btn-outline btn-sm flex items-center"
                >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            <div className="p-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-purple-900">Average Accuracy</p>
                                <p className="text-2xl font-bold text-purple-600">{stats.averageAccuracy}%</p>
                            </div>
                            <Target className="w-8 h-8 text-purple-500" />
                        </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-900">Total Predictions</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.totalPredictions}</p>
                            </div>
                            <Activity className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-900">High Accuracy</p>
                                <p className="text-2xl font-bold text-green-600">{stats.highAccuracyCount}</p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-green-500" />
                        </div>
                    </div>
                    <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-neutral-900">Trend</p>
                                <p className="text-lg font-bold text-neutral-600 flex items-center">
                                    {getTrendIcon()}
                                    <span className="ml-2 capitalize">{stats.trend}</span>
                                </p>
                            </div>
                            <BarChart3 className="w-8 h-8 text-neutral-500" />
                        </div>
                    </div>
                </div>

                {/* Accuracy Chart */}
                <div className="space-y-3">
                    <h4 className="text-md font-semibold text-neutral-900 flex items-center">
                        <Target className="w-4 h-4 mr-2" />
                        Recent Predictions Accuracy
                    </h4>
                    
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-3"></div>
                            <p className="text-neutral-600">Loading accuracy data...</p>
                        </div>
                    ) : accuracyData.length === 0 ? (
                        <div className="text-center py-8">
                            <BarChart3 className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                            <p className="text-neutral-600">No accuracy data available</p>
                            <p className="text-sm text-neutral-500 mt-1">Data will appear when AI predictions are made</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {accuracyData.slice(0, 10).map((item) => (
                                <div key={item.id} className="flex items-center space-x-4 p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
                                    <div className="flex-shrink-0 w-16 text-sm font-medium text-neutral-600">
                                        #{item.id}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-neutral-900 capitalize">
                                                {item.type} Prediction
                                            </span>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAccuracyColor(item.accuracy)}`}>
                                                {item.accuracy.toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-neutral-200 rounded-full h-2">
                                            <div 
                                                className={`h-2 rounded-full transition-all duration-300 ${
                                                    item.accuracy >= 80 ? 'bg-green-500' :
                                                    item.accuracy >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                                }`}
                                                style={{ width: `${getAccuracyBarWidth(item.accuracy)}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex items-center justify-between mt-1 text-xs text-neutral-500">
                                            <span className="capitalize">{item.severity} severity</span>
                                            <span>{item.timestamp.toLocaleTimeString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Legend */}
                <div className="mt-6 p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
                    <h5 className="text-sm font-medium text-neutral-900 mb-3">Accuracy Levels</h5>
                    <div className="flex flex-wrap gap-4 text-xs">
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-neutral-600">High (&gte;80%)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <span className="text-neutral-600">Medium (60-79%)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <span className="text-neutral-600">Low (&lt;60%)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccuracyChart;
