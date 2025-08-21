import React, { useState, useEffect } from 'react';
import { useSocket } from '../../../context/SocketContext';
import { Zap } from 'lucide-react';

const LiveFeed = () => {
    const [predictions, setPredictions] = useState([]);
    const { socket } = useSocket();

    useEffect(() => {
        if (socket) {
            const handleNewPrediction = (prediction) => {
                setPredictions(prev => [prediction, ...prev].slice(0, 10)); // Keep last 10 predictions
            };

            socket.on('new-ai-prediction', handleNewPrediction);

            return () => {
                socket.off('new-ai-prediction', handleNewPrediction);
            };
        }
    }, [socket]);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                Live AI Predictions
            </h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
                {predictions.length > 0 ? (
                    predictions.map((prediction, index) => {
                        const { data, createdAt } = prediction;
                        const firstPrediction = data.predictions[0];
                        const severity = firstPrediction.severity;
                        const isHighRisk = severity === 'high' || severity === 'extreme';
                        const location = firstPrediction.location;
                        const locationText = location.name || `${location.lat?.toFixed(2)}, ${location.lon?.toFixed(2)}`;

                        return (
                            <div key={index} className={`p-3 rounded-md border ${isHighRisk ? 'bg-red-50 border-red-200' : 'bg-neutral-50 border-neutral-200'}`}>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-neutral-800 capitalize">
                                            {firstPrediction.type}
                                        </p>
                                        <p className="text-sm text-neutral-600">{locationText}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full capitalize ${isHighRisk ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'}`}>
                                        {severity}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <p className="text-sm text-neutral-600">
                                        Confidence: <span className="font-medium">{(data.confidence_score * 100).toFixed(1)}%</span>
                                    </p>
                                    <p className="text-xs text-neutral-500">{new Date(createdAt).toLocaleTimeString()}</p>
                                </div>
                                {data.metadata?.risk_factors && (
                                    <div className="mt-2">
                                        <p className="text-xs text-neutral-500">
                                            Risk Factors: {data.metadata.risk_factors.join(', ')}
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <p className="text-neutral-500 text-center py-8">Waiting for new AI predictions...</p>
                )}
            </div>
        </div>
    );
};

export default LiveFeed;
