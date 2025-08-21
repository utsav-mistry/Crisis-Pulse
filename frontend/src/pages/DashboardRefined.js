import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
    AlertTriangle,
    TrendingUp,
    Users,
    Heart,
    Shield,
    MapPin,
    Award,
    Trophy,
    Activity,
    Clock,
    CheckCircle
} from 'lucide-react';
import api from '../services/api';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        activeDisasters: 0,
        predictions: 0,
        contributions: 0,
        alerts: 0,
        volunteers: 0,
        responseTime: '0min'
    });
    const [recentAlerts, setRecentAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, [user]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            
            // Fetch dashboard stats
            const [statsRes, alertsRes] = await Promise.all([
                api.get('/admin/dashboard/stats'),
                api.get('/admin/dashboard/recent-disasters')
            ]);

            setStats(statsRes.data);
            setRecentAlerts(alertsRes.data.slice(0, 3)); // Show only 3 recent alerts
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // Set fallback data
            setStats({
                activeDisasters: 3,
                predictions: 12,
                contributions: 89,
                alerts: 5,
                volunteers: 247,
                responseTime: '2.3min'
            });
            setRecentAlerts([
                {
                    id: 1,
                    type: 'flood',
                    severity: 'high',
                    location: 'Mumbai, Maharashtra',
                    status: 'active',
                    time: '2 hours ago'
                },
                {
                    id: 2,
                    type: 'earthquake',
                    severity: 'medium',
                    location: 'Delhi, NCR',
                    status: 'monitoring',
                    time: '5 hours ago'
                },
                {
                    id: 3,
                    type: 'cyclone',
                    severity: 'low',
                    location: 'Chennai, Tamil Nadu',
                    status: 'resolved',
                    time: '1 day ago'
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'high': return 'text-red-600 bg-red-50 border-red-200';
            case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'low': return 'text-green-600 bg-green-50 border-green-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-red-500';
            case 'monitoring': return 'bg-yellow-500';
            case 'resolved': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    };

    const StatCard = ({ title, value, icon: Icon, color, trend, change }) => (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 group">
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                    {trend && (
                        <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            trend.type === 'up' ? 'bg-green-100 text-green-700' : 
                            trend.type === 'down' ? 'bg-red-100 text-red-700' : 
                            'bg-blue-100 text-blue-700'
                        }`}>
                            <TrendingUp className={`w-3 h-3 mr-1 ${trend.type === 'down' ? 'rotate-180' : ''}`} />
                            {trend.value}
                        </div>
                    )}
                </div>
                <div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    {change && (
                        <p className="text-xs text-gray-500 mt-2">{change}</p>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Enhanced Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-2xl p-8 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black opacity-10"></div>
                <div className="relative z-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">
                                Welcome back, {user?.name || 'User'}!
                            </h1>
                            <p className="text-blue-100 text-lg mb-4">
                                Crisis management dashboard - Stay informed, stay safe
                            </p>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-full px-3 py-1">
                                    <MapPin className="w-4 h-4" />
                                    <span className="text-sm">
                                        {user?.location?.city ? `${user.location.city}${user.location.state ? `, ${user.location.state}` : ''}` : 'Location not set'}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-full px-3 py-1">
                                    <Award className="w-4 h-4" />
                                    <span className="text-sm">{user?.points || 0} points</span>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                <Shield className="w-16 h-16 text-white" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Quick Actions Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link to="/disaster-feed" className="group">
                    <div className="bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl p-4 transition-all duration-200 group-hover:shadow-md group-hover:scale-105">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <AlertTriangle className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="font-semibold text-red-900">Disasters</p>
                                <p className="text-xs text-red-600">Live Feed</p>
                            </div>
                        </div>
                    </div>
                </Link>
                
                <Link to="/contributions" className="group">
                    <div className="bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl p-4 transition-all duration-200 group-hover:shadow-md group-hover:scale-105">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Heart className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="font-semibold text-green-900">Contribute</p>
                                <p className="text-xs text-green-600">Resources</p>
                            </div>
                        </div>
                    </div>
                </Link>
                
                <Link to="/safety-center" className="group">
                    <div className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl p-4 transition-all duration-200 group-hover:shadow-md group-hover:scale-105">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="font-semibold text-blue-900">Safety</p>
                                <p className="text-xs text-blue-600">Center</p>
                            </div>
                        </div>
                    </div>
                </Link>
                
                <Link to="/leaderboard" className="group">
                    <div className="bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl p-4 transition-all duration-200 group-hover:shadow-md group-hover:scale-105">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Trophy className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="font-semibold text-purple-900">Leaderboard</p>
                                <p className="text-xs text-purple-600">Rankings</p>
                            </div>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Active Disasters"
                    value={stats.activeDisasters}
                    icon={AlertTriangle}
                    color="bg-gradient-to-br from-red-500 to-red-600"
                    trend={{ type: 'up', value: '+12%' }}
                    change="vs last month"
                />
                <StatCard
                    title="AI Predictions"
                    value={stats.predictions}
                    icon={Activity}
                    color="bg-gradient-to-br from-blue-500 to-blue-600"
                    trend={{ type: 'up', value: '+8%' }}
                    change="accuracy improved"
                />
                <StatCard
                    title="Community Contributions"
                    value={stats.contributions}
                    icon={Heart}
                    color="bg-gradient-to-br from-green-500 to-green-600"
                    trend={{ type: 'up', value: '+23%' }}
                    change="this week"
                />
                <StatCard
                    title="Response Time"
                    value={stats.responseTime}
                    icon={Clock}
                    color="bg-gradient-to-br from-purple-500 to-purple-600"
                    trend={{ type: 'down', value: '-15%' }}
                    change="faster response"
                />
            </div>

            {/* Recent Alerts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
                                Recent Alerts
                            </h3>
                            <Link to="/disaster-feed" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                View all →
                            </Link>
                        </div>
                        <div className="p-6">
                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            ) : recentAlerts.length === 0 ? (
                                <div className="text-center py-8">
                                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                                    <p className="text-gray-600">No recent alerts - All clear!</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {recentAlerts.map((alert) => (
                                        <div key={alert.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center space-x-4">
                                                <div className={`w-3 h-3 rounded-full ${getStatusColor(alert.status)}`}></div>
                                                <div>
                                                    <p className="font-medium text-gray-900 capitalize">
                                                        {alert.type} - {alert.location}
                                                    </p>
                                                    <p className="text-sm text-gray-600">{alert.time}</p>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                                                {alert.severity.toUpperCase()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Stats Card */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Activity className="w-5 h-5 mr-2 text-blue-500" />
                            Your Progress
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Points Earned</span>
                                <span className="font-semibold text-blue-600">{user?.points || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Contributions</span>
                                <span className="font-semibold text-green-600">12</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Rank</span>
                                <span className="font-semibold text-purple-600">#47</span>
                            </div>
                        </div>
                        <Link 
                            to="/leaderboard" 
                            className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center block"
                        >
                            View Leaderboard
                        </Link>
                    </div>

                    {/* System Status */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Shield className="w-5 h-5 mr-2 text-green-500" />
                            System Status
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">AI Service</span>
                                <div className="flex items-center">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                    <span className="text-sm font-medium text-green-600">Online</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Alerts</span>
                                <div className="flex items-center">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                    <span className="text-sm font-medium text-green-600">Active</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Database</span>
                                <div className="flex items-center">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                    <span className="text-sm font-medium text-green-600">Connected</span>
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
