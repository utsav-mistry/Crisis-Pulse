import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    AlertTriangle,
    TrendingUp,
    Heart,
    Bell,
    MapPin,
    Activity,
    Users,
    Shield,
    Clock,
    Target
} from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        activeDisasters: 3,
        predictions: 12,
        contributions: 45,
        alerts: 8,
        volunteers: 156,
        responseTime: '2.3min'
    });

    const [recentAlerts, setRecentAlerts] = useState([
        {
            id: 1,
            type: 'flood',
            location: 'Mumbai, Maharashtra',
            severity: 'high',
            time: '2 minutes ago',
            status: 'active'
        },
        {
            id: 2,
            type: 'earthquake',
            location: 'Delhi, NCR',
            severity: 'medium',
            time: '15 minutes ago',
            status: 'monitoring'
        },
        {
            id: 3,
            type: 'drought',
            location: 'Rajasthan',
            severity: 'low',
            time: '1 hour ago',
            status: 'resolved'
        }
    ]);

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'high': return 'text-emergency-600 bg-emergency-50 border-emergency-200';
            case 'medium': return 'text-warning-600 bg-warning-50 border-warning-200';
            case 'low': return 'text-safety-600 bg-safety-50 border-safety-200';
            default: return 'text-neutral-600 bg-neutral-50 border-neutral-200';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'status-dot-emergency';
            case 'monitoring': return 'status-dot-warning';
            case 'resolved': return 'status-dot-online';
            default: return 'status-dot-offline';
        }
    };

    const StatCard = ({ title, value, icon: Icon, color, change }) => (
        <div className="card">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-neutral-600">{title}</p>
                    <p className="text-2xl font-bold text-neutral-900">{value}</p>
                    {change && (
                        <p className="text-xs text-safety-600 flex items-center mt-1">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            {change}
                        </p>
                    )}
                </div>
                <div className={`w-12 h-12 ${color} rounded-sharp-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">
                        Welcome back, {user?.name || 'User'}
                    </h1>
                    <p className="text-neutral-600">
                        Here's what's happening in your area
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-neutral-400" />
                    <span className="text-sm text-neutral-600">
                        {user?.location?.city || 'Location not set'}
                    </span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Active Disasters"
                    value={stats.activeDisasters}
                    icon={AlertTriangle}
                    color="bg-emergency-600"
                    change="+2 today"
                />
                <StatCard
                    title="AI Predictions"
                    value={stats.predictions}
                    icon={TrendingUp}
                    color="bg-primary-600"
                    change="85% accuracy"
                />
                <StatCard
                    title="Contributions"
                    value={stats.contributions}
                    icon={Heart}
                    color="bg-safety-600"
                    change="+12 this week"
                />
                <StatCard
                    title="Active Alerts"
                    value={stats.alerts}
                    icon={Bell}
                    color="bg-warning-600"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Alerts */}
                <div className="lg:col-span-2">
                    <div className="card">
                        <div className="card-header">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-neutral-900">
                                    Recent Alerts
                                </h3>
                                <button className="btn btn-ghost text-sm">
                                    View all
                                </button>
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="space-y-4">
                                {recentAlerts.map((alert) => (
                                    <div key={alert.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-sharp-lg hover:bg-neutral-50 transition-colors">
                                        <div className="flex items-center space-x-4">
                                            <div className={`w-3 h-3 rounded-full ${getStatusColor(alert.status)}`}></div>
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="font-medium text-neutral-900">
                                                        {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}
                                                    </span>
                                                    <span className={`badge ${getSeverityColor(alert.severity)}`}>
                                                        {alert.severity}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-neutral-600">
                                                    {alert.location}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-neutral-500">
                                                {alert.time}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions & Stats */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="text-lg font-semibold text-neutral-900">
                                Quick Actions
                            </h3>
                        </div>
                        <div className="card-body">
                            <div className="space-y-3">
                                <button className="btn btn-emergency w-full justify-start">
                                    <AlertTriangle className="w-4 h-4 mr-2" />
                                    Report Emergency
                                </button>
                                <button className="btn btn-primary w-full justify-start">
                                    <Heart className="w-4 h-4 mr-2" />
                                    Make Contribution
                                </button>
                                <button className="btn btn-outline w-full justify-start">
                                    <TrendingUp className="w-4 h-4 mr-2" />
                                    View Predictions
                                </button>
                                <button className="btn btn-outline w-full justify-start">
                                    <Users className="w-4 h-4 mr-2" />
                                    Find Volunteers
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Response Stats */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="text-lg font-semibold text-neutral-900">
                                Response Stats
                            </h3>
                        </div>
                        <div className="card-body">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Clock className="w-4 h-4 text-neutral-400" />
                                        <span className="text-sm text-neutral-600">Avg Response Time</span>
                                    </div>
                                    <span className="text-sm font-medium text-neutral-900">
                                        {stats.responseTime}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Users className="w-4 h-4 text-neutral-400" />
                                        <span className="text-sm text-neutral-600">Active Volunteers</span>
                                    </div>
                                    <span className="text-sm font-medium text-neutral-900">
                                        {stats.volunteers}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Target className="w-4 h-4 text-neutral-400" />
                                        <span className="text-sm text-neutral-600">Success Rate</span>
                                    </div>
                                    <span className="text-sm font-medium text-safety-600">
                                        94.2%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* User Points */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="text-lg font-semibold text-neutral-900">
                                Your Points
                            </h3>
                        </div>
                        <div className="card-body">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-safety-600">
                                    {user?.points || 0}
                                </div>
                                <p className="text-sm text-neutral-600 mt-1">Total Points</p>
                                <div className="mt-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-neutral-600">Level</span>
                                        <span className="font-medium text-neutral-900">
                                            {user?.points > 100 ? 'Expert' : user?.points > 50 ? 'Advanced' : 'Beginner'}
                                        </span>
                                    </div>
                                    <div className="mt-2 w-full bg-neutral-200 rounded-full h-2">
                                        <div
                                            className="bg-safety-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${Math.min((user?.points || 0) / 100 * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard; 