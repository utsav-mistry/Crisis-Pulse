import React from 'react';
import { AlertTriangle, MapPin, Clock, Users } from 'lucide-react';

const Disasters = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Disasters</h1>
                    <p className="text-neutral-600">Monitor and respond to active disasters</p>
                </div>
                <button className="btn btn-emergency">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Report Emergency
                </button>
            </div>

            <div className="card">
                <div className="card-body text-center py-12">
                    <AlertTriangle className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-neutral-900 mb-2">Disasters Page</h3>
                    <p className="text-neutral-600">This page will show active disasters and emergency situations.</p>
                </div>
            </div>
        </div>
    );
};

export default Disasters; 