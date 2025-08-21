import React, { useState } from 'react';
import { Play, Square, Activity, AlertCircle } from 'lucide-react';

const LiveFeedControl = () => {
    const [feedStatus, setFeedStatus] = useState('stopped');
    const [loading, setLoading] = useState(false);

    const startLiveFeed = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8000/api/live-feed/start/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const result = await response.json();
                setFeedStatus('running');
                console.log('Live feed started:', result.message);
            } else {
                throw new Error(`Failed to start live feed: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error starting live feed:', error);
            alert(`Error starting live feed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const stopLiveFeed = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8000/api/live-feed/stop/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const result = await response.json();
                setFeedStatus('stopped');
                console.log('Live feed stopped:', result.message);
            } else {
                throw new Error(`Failed to stop live feed: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error stopping live feed:', error);
            alert(`Error stopping live feed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-blue-500" />
                Live Feed Control
            </h3>
            
            <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-md">
                    <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${feedStatus === 'running' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="font-medium text-neutral-800">
                            Status: {feedStatus === 'running' ? 'Running' : 'Stopped'}
                        </span>
                    </div>
                    <span className="text-sm text-neutral-600">
                        {feedStatus === 'running' ? 'Data flowing every 30s' : 'No data flow'}
                    </span>
                </div>

                <div className="flex space-x-3">
                    <button
                        onClick={startLiveFeed}
                        disabled={loading || feedStatus === 'running'}
                        className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-2 rounded-md font-medium flex items-center justify-center space-x-2 transition-colors"
                    >
                        <Play className="w-4 h-4" />
                        <span>{loading ? 'Starting...' : 'Start Feed'}</span>
                    </button>
                    
                    <button
                        onClick={stopLiveFeed}
                        disabled={loading || feedStatus === 'stopped'}
                        className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-4 py-2 rounded-md font-medium flex items-center justify-center space-x-2 transition-colors"
                    >
                        <Square className="w-4 h-4" />
                        <span>{loading ? 'Stopping...' : 'Stop Feed'}</span>
                    </button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <div className="flex items-start space-x-2">
                        <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">Live Feed Information:</p>
                            <ul className="text-xs space-y-1 text-blue-700">
                                <li>• Data prints to Django console in real-time</li>
                                <li>• Predictions appear in Live Feed component</li>
                                <li>• Updates every 30 seconds when running</li>
                                <li>• Includes weather conditions and risk factors</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveFeedControl;
