import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
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
    Target,
    Plus,
    ArrowRight,
    Zap,
    Award
} from 'lucide-react';

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
    const [loading, setLoading] = useState(true);

    const [recentAlerts, setRecentAlerts] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, [user]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            
            // Fetch dashboard stats
            const [statsRes, alertsRes] = await Promise.all([
                fetch('/api/dashboard/stats', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                }),
                fetch('/api/dashboard/recent-disasters', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                })
            ]);

            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setStats(statsData);
            }

            if (alertsRes.ok) {
                const alertsData = await alertsRes.json();
                setRecentAlerts(alertsData.slice(0, 3)); // Show only 3 recent alerts
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // Set fallback data
            setStats({
                activeDisasters: 3,
                predictions: 12,
                contributions: user?.contributions || 8,
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

    const StatCard = ({ title, value, icon: Icon, color, change, trend }) => (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm hover:shadow-lg transition-all duration-300 group">
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
                    <p className="text-2xl font-bold text-neutral-900 mb-1">{value}</p>
                    <p className="text-sm font-medium text-neutral-600">{title}</p>
                    {change && (
                        <p className="text-xs text-neutral-500 mt-2">{change}</p>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-2xl p-8 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black opacity-10"></div>
                <div className="relative z-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">
                                Welcome back, {user?.name || 'User'}! 👋
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

            {/* Quick Actions Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link to="/disasters/report" className="group">
                    <div className="bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl p-4 transition-all duration-200 group-hover:shadow-md">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <AlertTriangle className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="font-semibold text-red-900">Report</p>
                                <p className="text-xs text-red-600">Emergency</p>
                            </div>
                        </div>
                    </div>
                </Link>
                
                <Link to="/contribute" className="group">
                    <div className="bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl p-4 transition-all duration-200 group-hover:shadow-md">
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
                
                <Link to="/volunteer" className="group">
                    <div className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl p-4 transition-all duration-200 group-hover:shadow-md">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Users className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="font-semibold text-blue-900">Volunteer</p>
                                <p className="text-xs text-blue-600">Help Others</p>
                            </div>
                        </div>
                    </div>
                </Link>
                
                <Link to="/predictions" className="group">
                    <div className="bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl p-4 transition-all duration-200 group-hover:shadow-md">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Zap className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="font-semibold text-purple-900">AI Insights</p>
                                <p className="text-xs text-purple-600">Predictions</p>
                            </div>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Active Disasters"
                    value={stats.activeDisasters}
                    icon={AlertTriangle}
                    color="bg-red-500"
                    change="2 new today"
                    trend={{ type: 'up', value: '+15%' }}
                />
                <StatCard
                    title="AI Predictions"
                    value={stats.predictions}
                    icon={TrendingUp}
                    color="bg-blue-500"
                    change="85% accuracy rate"
                    trend={{ type: 'up', value: '+5%' }}
                />
                <StatCard
                    title="Your Contributions"
                    value={stats.contributions}
                    icon={Heart}
                    color="bg-green-500"
                    change="12 this week"
                    trend={{ type: 'up', value: '+20%' }}
                />
                <StatCard
                    title="Active Volunteers"
                    value={stats.volunteers}
                    icon={Users}
                    color="bg-purple-500"
                    change="Online now"
                    trend={{ type: 'stable', value: '94%' }}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Alerts */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl border border-neutral-200 shadow-sm">
                        <div className="flex items-center justify-between p-6 border-b border-neutral-100">
                            <h3 className="text-lg font-semibold text-neutral-900 flex items-center">
                                <Bell className="w-5 h-5 mr-2 text-orange-500" />
                                Recent Alerts
                            </h3>
                            <Link to="/disasters" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                                View all <ArrowRight className="w-4 h-4 ml-1" />
                            </Link>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {recentAlerts.map((alert) => (
                                    <div key={alert.id} className="flex items-center justify-between p-4 border border-neutral-100 rounded-lg hover:bg-neutral-50 transition-colors group">
                                        <div className="flex items-center space-x-4">
                                            <div className={`w-3 h-3 rounded-full ${getStatusColor(alert.status)}`}></div>
                                            <div>
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <span className="font-medium text-neutral-900 group-hover:text-blue-600 transition-colors">
                                                        {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)} Alert
                                                    </span>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                                                        {alert.severity}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-neutral-600 flex items-center">
                                                    <MapPin className="w-3 h-3 mr-1" />
                                                    {alert.location}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-neutral-500">{alert.time}</p>
                                            <p className="text-xs text-neutral-400 capitalize">{alert.status}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Your Progress */}
                    <div className="bg-white rounded-xl border border-neutral-200 shadow-sm">
                        <div className="p-6 border-b border-neutral-100">
                            <h3 className="text-lg font-semibold text-neutral-900 flex items-center">
                                <Award className="w-5 h-5 mr-2 text-yellow-500" />
                                Your Progress
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="text-center mb-6">
                                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl font-bold text-white">{user?.points || 0}</span>
                                </div>
                                <p className="text-sm text-neutral-600">Total Points Earned</p>
                                <p className="text-lg font-semibold text-neutral-900 mt-1">
                                    {user?.points > 1000 ? 'Expert' : user?.points > 500 ? 'Advanced' : user?.points > 100 ? 'Intermediate' : 'Beginner'} Level
                                </p>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Heart className="w-4 h-4 text-green-500" />
                                        <span className="text-sm text-neutral-600">Contributions</span>
                                    </div>
                                    <span className="text-sm font-medium text-neutral-900">{user?.contributions || 8}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Users className="w-4 h-4 text-blue-500" />
                                        <span className="text-sm text-neutral-600">Help Logs</span>
                                    </div>
                                    <span className="text-sm font-medium text-neutral-900">{user?.helpLogs || 4}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Target className="w-4 h-4 text-purple-500" />
                                        <span className="text-sm text-neutral-600">Success Rate</span>
                                    </div>
                                    <span className="text-sm font-medium text-green-600">92%</span>
                                </div>
                            </div>

                            <Link to="/leaderboard" className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg px-4 py-3 text-sm font-medium hover:shadow-lg transition-all duration-200 flex items-center justify-center">
                                View Leaderboard <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                        </div>
                    </div>

                    {/* System Status */}
                    <div className="bg-white rounded-xl border border-neutral-200 shadow-sm">
                        <div className="p-6 border-b border-neutral-100">
                            <h3 className="text-lg font-semibold text-neutral-900 flex items-center">
                                <Activity className="w-5 h-5 mr-2 text-green-500" />
                                System Status
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className="text-sm text-neutral-600">AI Predictions</span>
                                    </div>
                                    <span className="text-sm font-medium text-green-600">Online</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className="text-sm text-neutral-600">Alert System</span>
                                    </div>
                                    <span className="text-sm font-medium text-green-600">Active</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                        <span className="text-sm text-neutral-600">Response Time</span>
                                    </div>
                                    <span className="text-sm font-medium text-yellow-600">2.3 min</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className="text-sm text-neutral-600">Volunteers</span>
                                    </div>
                                    <span className="text-sm font-medium text-green-600">247 Active</span>
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