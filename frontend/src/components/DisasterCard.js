import React from 'react';
import { 
    AlertTriangle, 
    MapPin, 
    Clock, 
    Users, 
    TrendingUp,
    Shield,
    Heart,
    Eye
} from 'lucide-react';

const DisasterCard = ({ disaster, onView, onContribute, showActions = true }) => {
    const getSeverityColor = (severity) => {
        switch (severity?.toLowerCase()) {
            case 'critical':
                return 'text-red-600 bg-red-100 border-red-200';
            case 'high':
                return 'text-orange-600 bg-orange-100 border-orange-200';
            case 'medium':
                return 'text-yellow-600 bg-yellow-100 border-yellow-200';
            case 'low':
                return 'text-green-600 bg-green-100 border-green-200';
            default:
                return 'text-neutral-600 bg-neutral-100 border-neutral-200';
        }
    };

    const getDisasterIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'earthquake':
                return '🏠';
            case 'flood':
                return '🌊';
            case 'fire':
                return '🔥';
            case 'cyclone':
            case 'hurricane':
                return '🌀';
            case 'landslide':
                return '⛰️';
            case 'drought':
                return '🌵';
            default:
                return '⚠️';
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return 'text-red-600 bg-red-50';
            case 'monitoring':
                return 'text-yellow-600 bg-yellow-50';
            case 'resolved':
                return 'text-green-600 bg-green-50';
            default:
                return 'text-neutral-600 bg-neutral-50';
        }
    };

    return (
        <div className="card hover:shadow-lg transition-shadow duration-200">
            <div className="card-body">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="text-2xl">
                            {getDisasterIcon(disaster.type)}
                        </div>
                        <div>
                            <h3 className="font-semibold text-neutral-900 capitalize">
                                {disaster.type} Alert
                            </h3>
                            <div className="flex items-center space-x-2 mt-1">
                                <span className={`badge ${getSeverityColor(disaster.severity)}`}>
                                    {disaster.severity}
                                </span>
                                <span className={`badge ${getStatusColor(disaster.status)}`}>
                                    {disaster.status}
                                </span>
                            </div>
                        </div>
                    </div>
                    {disaster.aiPredicted && (
                        <div className="flex items-center space-x-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            <TrendingUp className="w-3 h-3" />
                            <span>AI Predicted</span>
                        </div>
                    )}
                </div>

                {/* Location */}
                <div className="flex items-center space-x-2 text-sm text-neutral-600 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>
                        {disaster.location?.city}, {disaster.location?.state}
                        {disaster.location?.pincode && ` - ${disaster.location.pincode}`}
                    </span>
                </div>

                {/* Description */}
                {disaster.description && (
                    <p className="text-sm text-neutral-700 mb-4 line-clamp-2">
                        {disaster.description}
                    </p>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-sm">
                        <Users className="w-4 h-4 text-neutral-500" />
                        <span className="text-neutral-600">
                            {disaster.affectedPeople || 0} affected
                        </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                        <Heart className="w-4 h-4 text-neutral-500" />
                        <span className="text-neutral-600">
                            {disaster.contributionsCount || 0} contributions
                        </span>
                    </div>
                </div>

                {/* Timestamp */}
                <div className="flex items-center space-x-2 text-xs text-neutral-500 mb-4">
                    <Clock className="w-3 h-3" />
                    <span>
                        Reported {formatDate(disaster.createdAt)}
                    </span>
                </div>

                {/* CRPF Status */}
                {disaster.crpfNotified && (
                    <div className="flex items-center space-x-2 text-sm text-blue-600 bg-blue-50 p-2 rounded mb-4">
                        <Shield className="w-4 h-4" />
                        <span>CRPF has been notified and is responding</span>
                    </div>
                )}

                {/* Actions */}
                {showActions && (
                    <div className="flex space-x-2 pt-2 border-t border-neutral-100">
                        <button
                            onClick={() => onView && onView(disaster)}
                            className="btn btn-outline btn-sm flex-1"
                        >
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                        </button>
                        {disaster.status === 'active' && (
                            <button
                                onClick={() => onContribute && onContribute(disaster)}
                                className="btn btn-primary btn-sm flex-1"
                            >
                                <Heart className="w-4 h-4 mr-1" />
                                Contribute
                            </button>
                        )}
                    </div>
                )}

                {/* Emergency Contact */}
                {disaster.severity === 'critical' && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm">
                        <div className="flex items-center space-x-2 text-red-800">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="font-medium">Emergency Contact:</span>
                        </div>
                        <p className="text-red-700 mt-1">
                            Call 108 for emergency services or contact local authorities
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DisasterCard;
