import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';
import axios from 'axios';
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
    TrendingUp
} from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalDisasters: 0,
        activeVolunteers: 0,
        pendingVerifications: 0,
        onlineUsers: 0,
        totalContributions: 0
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
                const [usersRes, disastersRes, volunteersRes, verificationsRes, contributionsRes] = await Promise.all([
                    axios.get('/api/users', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
                    axios.get('/api/disasters', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
                    axios.get('/api/users?role=volunteer', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
                    axios.get('/api/volunteer-help?status=pending', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
                    axios.get('/api/contributions', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
                ]);

                setStats({
                    totalUsers: usersRes.data.length || 0,
                    totalDisasters: disastersRes.data.filter(d => d.status === 'active').length || 0,
                    activeVolunteers: volunteersRes.data.length || 0,
                    pendingVerifications: verificationsRes.data.length || 0,
                    onlineUsers: 0, // Remove mock data
                    totalContributions: contributionsRes.data.length || 0
                });
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
            const response = await axios.post('/api/disasters/raise', newDisaster, {
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-neutral-600">Total Users</p>
                            <p className="text-2xl font-bold text-neutral-900">{stats.totalUsers}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-neutral-600">Active Disasters</p>
                            <p className="text-2xl font-bold text-neutral-900">{stats.totalDisasters}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <Shield className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-neutral-600">Active Volunteers</p>
                            <p className="text-2xl font-bold text-neutral-900">{stats.activeVolunteers}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <Clock className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-neutral-600">Pending Verifications</p>
                            <p className="text-2xl font-bold text-neutral-900">{stats.pendingVerifications}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Activity className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-neutral-600">Online Users</p>
                            <p className="text-2xl font-bold text-neutral-900">{stats.onlineUsers}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-neutral-600">Total Contributions</p>
                            <p className="text-2xl font-bold text-neutral-900">{stats.totalContributions}</p>
                        </div>
                    </div>
                </div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;