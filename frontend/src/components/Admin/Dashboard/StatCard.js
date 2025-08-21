import React from 'react';

const StatCard = ({ icon, label, value, color }) => {
    const colorClasses = {
        blue: 'bg-blue-100 text-blue-600',
        red: 'bg-red-100 text-red-600',
        green: 'bg-green-100 text-green-600',
        yellow: 'bg-yellow-100 text-yellow-600',
        purple: 'bg-purple-100 text-purple-600',
        indigo: 'bg-indigo-100 text-indigo-600',
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
                    {icon}
                </div>
                <div className="ml-4">
                    <p className="text-sm font-medium text-neutral-600">{label}</p>
                    <p className="text-2xl font-bold text-neutral-900">{value}</p>
                </div>
            </div>
        </div>
    );
};

export default StatCard;
