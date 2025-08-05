import React from 'react';
import { TrendingUp, BarChart3, Target } from 'lucide-react';

const Predictions = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">AI Predictions</h1>
                    <p className="text-neutral-600">AI-powered disaster prediction and analysis</p>
                </div>
                <button className="btn btn-primary">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    New Prediction
                </button>
            </div>

            <div className="card">
                <div className="card-body text-center py-12">
                    <TrendingUp className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-neutral-900 mb-2">Predictions Page</h3>
                    <p className="text-neutral-600">This page will show AI predictions and risk assessments.</p>
                </div>
            </div>
        </div>
    );
};

export default Predictions; 