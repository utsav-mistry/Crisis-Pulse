import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart as BarChartIcon, Bell, Users, Heart, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// This is a new component for displaying analytics.
// We will add charts and AI data visualizations here.

const Analytics = ({ stats }) => {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [aiInsights, setAiInsights] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('/api/analytics', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAnalyticsData(res.data);
            } catch (error) {
                console.error('Failed to fetch analytics data', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchAiInsights = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('/api/analytics/insights', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAiInsights(res.data);
            } catch (error) {
                console.error('Failed to fetch AI insights', error);
            }
        };

        fetchAnalytics();
        fetchAiInsights(); // Initial fetch

        const intervalId = setInterval(fetchAiInsights, 5000); // Poll every 5 seconds

        return () => clearInterval(intervalId); // Cleanup on unmount
    }, []);

    const monthMap = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const formattedVolunteerData = analyticsData?.volunteerActivity.map(item => ({
        ...item,
        monthName: monthMap[item.month - 1]
    }));

    const formattedContributionData = analyticsData?.contributionTrends.map(item => ({
        ...item,
        monthName: monthMap[item.month - 1]
    }));

    const taskCompletionData = [
        { name: 'Completed', value: analyticsData?.taskCompletion.completed || 0 },
        { name: 'Pending', value: (analyticsData?.taskCompletion.total || 0) - (analyticsData?.taskCompletion.completed || 0) },
    ];

    const COLORS = ['#10b981', '#f59e0b'];

    const AnalyticsSkeleton = () => (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <BarChartIcon className="mr-2" />
                <Skeleton width={200} />
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[...Array(4)].map((_, i) => (
                    <div key={`skeleton-${i}`} className="bg-gray-50 p-4 rounded-lg">
                        <Skeleton height={30} />
                        <Skeleton height={20} width="80%" />
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <Skeleton height={300} />
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <Skeleton height={300} />
                </div>
            </div>
        </div>
    );

    if (loading) {
        return <AnalyticsSkeleton />;
    }

    if (!analyticsData) {
        return <p>Could not load analytics data.</p>;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <BarChartIcon className="mr-2" />
                System Analytics
            </h2>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-red-100 p-4 rounded-lg flex items-center">
                    <div className="p-3 rounded-full bg-red-200">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Active Disasters</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.activeDisasters}</p>
                    </div>
                </div>
                <div className="bg-green-100 p-4 rounded-lg flex items-center">
                    <div className="p-3 rounded-full bg-green-200">
                        <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Volunteers</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalVolunteers}</p>
                    </div>
                </div>
                <div className="bg-blue-100 p-4 rounded-lg flex items-center">
                    <div className="p-3 rounded-full bg-blue-200">
                        <Heart className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Contributions</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalContributions}</p>
                    </div>
                </div>
                <div className="bg-yellow-100 p-4 rounded-lg flex items-center">
                    <div className="p-3 rounded-full bg-yellow-200">
                        <Bell className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">CRPF Notifications</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalCrpfNotifications}</p>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-2">Disaster Types</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analyticsData.disasterTypes}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#ef4444" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-2">Volunteer Activity</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={formattedVolunteerData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="monthName" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="count" stroke="#22c55e" name="New Volunteers" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-2">Contribution Trends</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={formattedContributionData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="monthName" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="total" stroke="#3b82f6" name="Contributions" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-2">Task Completion Rate</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={taskCompletionData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {taskCompletionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Live AI Disaster Feed */}
            <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-2">Live AI Disaster Feed</h3>
                <div className="h-96 overflow-y-auto bg-white rounded p-2 space-y-3">
                    {aiInsights && aiInsights.insights && aiInsights.insights.length > 0 ? (
                        aiInsights.insights.map((insight) => (
                            <div key={insight.id} className={`p-3 rounded-lg border ${insight.status === 'SUCCESS' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className={`font-semibold text-sm ${insight.status === 'SUCCESS' ? 'text-green-800' : 'text-red-800'}`}>
                                        {insight.type} - {insight.status}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {new Date(insight.timestamp).toLocaleTimeString()}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-700 mb-2">{insight.message}</p>
                                {insight.data && (
                                    <pre className="bg-gray-100 p-2 rounded text-xs text-gray-600 overflow-x-auto">
                                        {JSON.stringify(insight.data, null, 2)}
                                    </pre>
                                )}
                                {insight.error && (
                                    <p className="text-xs text-red-600">Error: {insight.error}</p>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-center py-4">Waiting for AI insights...</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Analytics;
