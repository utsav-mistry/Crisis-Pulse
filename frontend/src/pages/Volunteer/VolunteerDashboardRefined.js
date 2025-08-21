import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import {
    Heart,
    Award,
    TrendingUp,
    Clock,
    CheckCircle,
    AlertTriangle,
    Users,
    Target,
    Activity
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const VolunteerDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        pointsEarned: 0
    });
    const [recentTasks, setRecentTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.role === 'volunteer') {
            fetchVolunteerData();
        }
    }, [user]);

    const fetchVolunteerData = async () => {
        try {
            setLoading(true);
            const [tasksRes] = await Promise.all([
                api.get('/volunteer-tasks/my-tasks')
            ]);

            const tasks = tasksRes.data;
            setRecentTasks(tasks.slice(0, 5));
            
            // Calculate stats
            const completedTasks = tasks.filter(t => t.status === 'approved').length;
            const pendingTasks = tasks.filter(t => ['claimed', 'submitted'].includes(t.status)).length;
            
            setStats({
                totalTasks: tasks.length,
                completedTasks,
                pendingTasks,
                pointsEarned: user?.points || 0
            });
        } catch (error) {
            console.error('Error fetching volunteer data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'claimed': return 'bg-yellow-100 text-yellow-800';
            case 'submitted': return 'bg-blue-100 text-blue-800';
            case 'approved': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const StatCard = ({ title, value, icon: Icon, color, trend, description }) => (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 group">
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                    {trend && (
                        <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            trend.type === 'up' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                            <TrendingUp className={`w-3 h-3 mr-1 ${trend.type === 'down' ? 'rotate-180' : ''}`} />
                            {trend.value}
                        </div>
                    )}
                </div>
                <div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    {description && (
                        <p className="text-xs text-gray-500 mt-2">{description}</p>
                    )}
                </div>
            </div>
        </div>
    );

    if (user?.role !== 'volunteer') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
                    <p className="text-gray-600 mt-2">This page is only accessible to volunteers.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Enhanced Volunteer Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Volunteer Dashboard</h1>
                        <p className="text-green-100 text-lg">Making a difference in disaster response</p>
                        <div className="flex items-center mt-3 space-x-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                <span className="text-sm text-green-100">Ready to Help</span>
                            </div>
                            <div className="text-sm text-green-100">
                                Welcome back, {user?.name}!
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                            <div className="text-sm text-green-100 mb-1">Your Points</div>
                            <div className="text-3xl font-bold">{user?.points || 0}</div>
                            <div className="text-xs text-green-200 mt-1">Keep contributing!</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/volunteer/tasks" className="group">
                    <div className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl p-4 transition-all duration-200 group-hover:shadow-md group-hover:scale-105">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Target className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="font-semibold text-blue-900">View Tasks</p>
                                <p className="text-xs text-blue-600">Claim & Complete</p>
                            </div>
                        </div>
                    </div>
                </Link>

                <Link to="/volunteer/log-help" className="group">
                    <div className="bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl p-4 transition-all duration-200 group-hover:shadow-md group-hover:scale-105">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Heart className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="font-semibold text-green-900">Log Help</p>
                                <p className="text-xs text-green-600">Record Activity</p>
                            </div>
                        </div>
                    </div>
                </Link>

                <Link to="/leaderboard" className="group">
                    <div className="bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl p-4 transition-all duration-200 group-hover:shadow-md group-hover:scale-105">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Award className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="font-semibold text-purple-900">Leaderboard</p>
                                <p className="text-xs text-purple-600">Your Ranking</p>
                            </div>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Tasks"
                    value={stats.totalTasks}
                    icon={Target}
                    color="bg-gradient-to-br from-blue-500 to-blue-600"
                    trend={{ type: 'up', value: '+5' }}
                    description="Tasks claimed"
                />
                <StatCard
                    title="Completed Tasks"
                    value={stats.completedTasks}
                    icon={CheckCircle}
                    color="bg-gradient-to-br from-green-500 to-green-600"
                    trend={{ type: 'up', value: '+3' }}
                    description="Successfully verified"
                />
                <StatCard
                    title="Pending Tasks"
                    value={stats.pendingTasks}
                    icon={Clock}
                    color="bg-gradient-to-br from-yellow-500 to-yellow-600"
                    description="In progress"
                />
                <StatCard
                    title="Points Earned"
                    value={stats.pointsEarned}
                    icon={Award}
                    color="bg-gradient-to-br from-purple-500 to-purple-600"
                    trend={{ type: 'up', value: '+25' }}
                    description="Total contribution"
                />
            </div>

            {/* Recent Tasks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <Activity className="w-5 h-5 mr-2 text-blue-500" />
                            Recent Tasks
                        </h3>
                        <Link to="/volunteer/tasks" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                            View all →
                        </Link>
                    </div>
                    <div className="p-6">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : recentTasks.length === 0 ? (
                            <div className="text-center py-8">
                                <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-600">No tasks yet</p>
                                <Link to="/volunteer/tasks" className="text-blue-600 hover:text-blue-700 text-sm">
                                    Browse available tasks
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentTasks.map((task) => (
                                    <div key={task._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900 mb-1">
                                                {task.description}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {task.disaster?.title} - {task.disaster?.location}
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                            {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Progress Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                            Your Impact
                        </h3>
                    </div>
                    <div className="p-6">
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-700">Task Completion Rate</span>
                                    <span className="text-sm text-gray-500">
                                        {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                        style={{ 
                                            width: `${stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0}%` 
                                        }}
                                    ></div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">{stats.completedTasks}</div>
                                    <div className="text-xs text-blue-600">Tasks Completed</div>
                                </div>
                                <div className="text-center p-4 bg-purple-50 rounded-lg">
                                    <div className="text-2xl font-bold text-purple-600">{stats.pointsEarned}</div>
                                    <div className="text-xs text-purple-600">Points Earned</div>
                                </div>
                            </div>

                            <Link 
                                to="/volunteer/tasks" 
                                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-center block"
                            >
                                Find New Tasks
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VolunteerDashboard;
