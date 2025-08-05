import React from 'react';
import { Bell, AlertCircle, Settings } from 'lucide-react';

const Alerts = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Alerts</h1>
                    <p className="text-neutral-600">Manage your notifications and alerts</p>
                </div>
                <button className="btn btn-outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Alert Settings
                </button>
            </div>

            <div className="card">
                <div className="card-body text-center py-12">
                    <Bell className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-neutral-900 mb-2">Alerts Page</h3>
                    <p className="text-neutral-600">This page will show your notifications and alert settings.</p>
                </div>
            </div>
        </div>
    );
};

export default Alerts; 