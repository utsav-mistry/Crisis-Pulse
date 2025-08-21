import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { 
    Users, 
    AlertTriangle, 
    Shield, 
    Clock, 
    Activity, 
    Bell, 
    Plus, 
    Trash2, 
    Send,
    UserCheck,
    MapPin,
    TrendingUp,
    FileText
} from 'lucide-react';
import Analytics from '../../components/Admin/Analytics';
import StatCard from '../../components/Admin/Dashboard/StatCard';
import LiveFeed from '../../components/Admin/Dashboard/LiveFeed';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        users: 0,
        activeDisasters: 0,
        volunteers: 0,
        pendingVerifications: 0,
        contributions: 0,
        predictions: 0,
        alerts: 0,
        responseTime: '0min'
    });
    const [loading, setLoading] = useState(true);
    const [testNotification, setTestNotification] = useState('');
    const [newDisaster, setNewDisaster] = useState({
        title: '',
        description: '',
        location: '',
        severity: 'medium',
        type: 'flood'
    });
    const [showAddDisaster, setShowAddDisaster] = useState(false);
    
    const { user } = useAuth();
    const { socket } = useSocket();
    const navigate = useNavigate();

    // Redirect if not admin
    useEffect(() => {
        if (user && user.role !== 'admin') {
            navigate('/dashboard');
            toast.error('Unauthorized access');
        }
    }, [user, navigate]);

    // Fetch dashboard stats
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/dashboard/stats', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setStats(data);
            } catch (error) {
                console.error('Error fetching stats:', error);
                toast.error('Failed to load dashboard stats');
            } finally {
                setLoading(false);
            }
        };

        if (user?.role === 'admin') {
            fetchStats();
        }
    }, [user]);

    const handleSendTestNotification = () => {
        if (!testNotification.trim()) {
            toast.error('Please enter a notification message');
            return;
        }

        if (socket) {
            socket.emit('admin-test-notification', {
                message: testNotification,
                adminName: user.name
            });
            toast.success('Test notification sent to all users');
            setTestNotification('');
        } else {
            toast.error('Socket connection not available');
        }
    };

    const handleAddDisaster = async () => {
        try {
            const response = await api.post('/disasters/raise', newDisaster, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            toast.success('Disaster added successfully');
            setNewDisaster({
                title: '',
                description: '',
                location: '',
                severity: 'medium',
                type: 'flood'
            });
            setShowAddDisaster(false);

            // Refresh stats
            window.location.reload();
        } catch (error) {
            console.error('Error adding disaster:', error);
            toast.error('Failed to add disaster');
        }
    };

    const handleSendEmergencyAlert = () => {
        if (socket) {
            socket.emit('emergency-alert', {
                message: 'EMERGENCY: This is a test emergency alert from admin',
                severity: 'extreme',
                adminName: user.name
            });
            toast.success('Emergency alert sent to all users');
        } else {
            toast.error('Socket connection not available');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-neutral-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900">Admin Dashboard</h1>
                        <p className="text-neutral-600 mt-1">Manage the Crisis Pulse system and monitor activity</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-neutral-600">System Active</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<Users className="w-6 h-6" />} label="Total Users" value={stats.users} color="blue" />
                <StatCard icon={<AlertTriangle className="w-6 h-6" />} label="Active Disasters" value={stats.activeDisasters} color="red" />
                <StatCard icon={<Shield className="w-6 h-6" />} label="Active Volunteers" value={stats.volunteers} color="green" />
                <StatCard icon={<Clock className="w-6 h-6" />} label="Pending Verifications" value={stats.pendingVerifications} color="yellow" />
                <StatCard icon={<TrendingUp className="w-6 h-6" />} label="Total Contributions" value={stats.contributions} color="indigo" />
                <StatCard icon={<Activity className="w-6 h-6" />} label="AI Predictions" value={stats.predictions} color="purple" />
                <StatCard icon={<Bell className="w-6 h-6" />} label="System Alerts" value={stats.alerts} color="red" />
                <StatCard icon={<Clock className="w-6 h-6" />} label="Avg. Response Time" value={stats.responseTime} color="blue" />
            </div>

            {/* Live Feed and Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Analytics stats={stats} />
                <LiveFeed />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Test Notifications */}
                <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-4">Test Notifications</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                Test Message
                            </label>
                            <textarea
                                value={testNotification}
                                onChange={(e) => setTestNotification(e.target.value)}
                                placeholder="Enter test notification message..."
                                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                rows="3"
                            />
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={handleSendTestNotification}
                                className="btn btn-primary flex items-center"
                            >
                                <Send className="w-4 h-4 mr-2" />
                                Send Test
                            </button>
                            <button
                                onClick={handleSendEmergencyAlert}
                                className="btn bg-red-600 text-white hover:bg-red-700 flex items-center"
                            >
                                <Bell className="w-4 h-4 mr-2" />
                                Emergency Alert
                            </button>
                        </div>
                    </div>
                </div>

                {/* Quick Add Disaster */}
                <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-neutral-900">Quick Add Disaster</h3>
                        <button
                            onClick={() => setShowAddDisaster(!showAddDisaster)}
                            className="btn btn-outline btn-sm"
                        >
                            <Plus className="w-4 h-4 mr-1" />
                            {showAddDisaster ? 'Cancel' : 'Add'}
                        </button>
                    </div>
                    
                    {showAddDisaster && (
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Disaster title"
                                value={newDisaster.title}
                                onChange={(e) => setNewDisaster({...newDisaster, title: e.target.value})}
                                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            <input
                                type="text"
                                placeholder="Location"
                                value={newDisaster.location}
                                onChange={(e) => setNewDisaster({...newDisaster, location: e.target.value})}
                                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <select
                                    value={newDisaster.severity}
                                    onChange={(e) => setNewDisaster({...newDisaster, severity: e.target.value})}
                                    className="px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="extreme">Extreme</option>
                                </select>
                                <select
                                    value={newDisaster.type}
                                    onChange={(e) => setNewDisaster({...newDisaster, type: e.target.value})}
                                    className="px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="flood">Flood</option>
                                    <option value="earthquake">Earthquake</option>
                                    <option value="fire">Fire</option>
                                    <option value="storm">Storm</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <textarea
                                placeholder="Description"
                                value={newDisaster.description}
                                onChange={(e) => setNewDisaster({...newDisaster, description: e.target.value})}
                                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                rows="2"
                            />
                            <button
                                onClick={handleAddDisaster}
                                className="btn btn-primary w-full"
                            >
                                Add Disaster
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Management Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">System Management</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <button 
                        onClick={() => navigate('/admin/crpf-notifications')}
                        className="btn btn-outline flex items-center justify-center p-4 h-auto"
                    >
                        <Bell className="w-5 h-5 mr-2" />
                        <span>CRPF Notifications</span>
                    </button>
                    <button 
                        onClick={() => navigate('/admin/volunteer-verification')}
                        className="btn btn-outline flex items-center justify-center p-4 h-auto"
                    >
                        <UserCheck className="w-5 h-5 mr-2" />
                        <span>Verify Volunteers</span>
                    </button>
                    <button 
                        onClick={() => navigate('/disasters')}
                        className="btn btn-outline flex items-center justify-center p-4 h-auto"
                    >
                        <MapPin className="w-5 h-5 mr-2" />
                        <span>Manage Disasters</span>
                    </button>
                    <button 
                        onClick={() => navigate('/leaderboard')}
                        className="btn btn-outline flex items-center justify-center p-4 h-auto"
                    >
                        <TrendingUp className="w-5 h-5 mr-2" />
                        <span>View Leaderboard</span>
                    </button>
                    <button 
                        onClick={() => navigate('/admin/subscriptions')}
                        className="btn btn-outline flex items-center justify-center p-4 h-auto"
                    >
                        <Users className="w-5 h-5 mr-2" />
                        <span>Subscriptions</span>
                    </button>
                    <button 
                        onClick={() => navigate('/admin/test-logs')}
                        className="btn btn-outline flex items-center justify-center p-4 h-auto"
                    >
                        <FileText className="w-5 h-5 mr-2" />
                        <span>Test Logs</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;