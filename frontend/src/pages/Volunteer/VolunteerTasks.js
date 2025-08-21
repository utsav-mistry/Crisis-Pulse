import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const VolunteerTasks = () => {
    const { user } = useAuth();
    const [openTasks, setOpenTasks] = useState([]);
    const [myTasks, setMyTasks] = useState([]);
    const [activeTab, setActiveTab] = useState('open');
    const [loading, setLoading] = useState(false);
    const [submissionData, setSubmissionData] = useState({});

    useEffect(() => {
        if (user?.role === 'volunteer') {
            fetchOpenTasks();
            fetchMyTasks();
        }
    }, [user]);

    const fetchOpenTasks = async () => {
        try {
            setLoading(true);
            const response = await api.get('/volunteer-tasks');
            setOpenTasks(response.data);
        } catch (error) {
            console.error('Error fetching open tasks:', error);
            toast.error('Failed to load open tasks');
        } finally {
            setLoading(false);
        }
    };

    const fetchMyTasks = async () => {
        try {
            const response = await api.get('/volunteer-tasks/my-tasks');
            setMyTasks(response.data);
        } catch (error) {
            console.error('Error fetching my tasks:', error);
            toast.error('Failed to load your tasks');
        }
    };

    const handleClaimTask = async (taskId) => {
        try {
            await api.post(`/volunteer-tasks/${taskId}/claim`);
            toast.success('Task claimed successfully! You have 24 hours to complete it.');
            fetchOpenTasks();
            fetchMyTasks();
        } catch (error) {
            console.error('Error claiming task:', error);
            toast.error(error.response?.data?.message || 'Failed to claim task');
        }
    };

    const handleSubmitTask = async (taskId) => {
        try {
            const proof = submissionData[taskId];
            if (!proof?.trim()) {
                toast.error('Please provide proof of completion');
                return;
            }

            await api.post(`/volunteer-tasks/${taskId}/submit`, { proof });
            toast.success('Task submitted successfully! Awaiting admin verification.');
            setSubmissionData(prev => ({ ...prev, [taskId]: '' }));
            fetchMyTasks();
        } catch (error) {
            console.error('Error submitting task:', error);
            toast.error(error.response?.data?.message || 'Failed to submit task');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'bg-green-100 text-green-800';
            case 'claimed': return 'bg-yellow-100 text-yellow-800';
            case 'submitted': return 'bg-blue-100 text-blue-800';
            case 'approved': return 'bg-emerald-100 text-emerald-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            case 'expired': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'high': return 'text-red-600';
            case 'medium': return 'text-yellow-600';
            case 'low': return 'text-green-600';
            default: return 'text-gray-600';
        }
    };

    const formatTimeRemaining = (deadline) => {
        const now = new Date();
        const deadlineDate = new Date(deadline);
        const diffInMs = deadlineDate - now;
        
        if (diffInMs <= 0) return 'Expired';
        
        const hours = Math.floor(diffInMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours > 0) {
            return `${hours}h ${minutes}m remaining`;
        }
        return `${minutes}m remaining`;
    };

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
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Volunteer Tasks</h1>
                    <p className="text-gray-600 mt-2">
                        Claim tasks to help during disasters and earn points for your contributions.
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="mb-6">
                    <nav className="flex space-x-8">
                        <button
                            onClick={() => setActiveTab('open')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'open'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Open Tasks ({openTasks.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('my-tasks')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'my-tasks'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            My Tasks ({myTasks.length})
                        </button>
                    </nav>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {activeTab === 'open' && (
                            <div>
                                {openTasks.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="text-gray-400 text-6xl mb-4">📋</div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Open Tasks</h3>
                                        <p className="text-gray-600">Check back later for new volunteer opportunities.</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {openTasks.map((task) => (
                                            <div key={task._id} className="bg-white rounded-lg shadow-md p-6">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                            {task.description}
                                                        </h3>
                                                        {task.disaster && (
                                                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                                                <span className="flex items-center">
                                                                    <span className="font-medium">Disaster:</span>
                                                                    <span className="ml-1">{task.disaster.title}</span>
                                                                </span>
                                                                <span className="flex items-center">
                                                                    <span className="font-medium">Type:</span>
                                                                    <span className="ml-1 capitalize">{task.disaster.type}</span>
                                                                </span>
                                                                <span className="flex items-center">
                                                                    <span className="font-medium">Severity:</span>
                                                                    <span className={`ml-1 capitalize font-medium ${getSeverityColor(task.disaster.severity)}`}>
                                                                        {task.disaster.severity}
                                                                    </span>
                                                                </span>
                                                            </div>
                                                        )}
                                                        {task.requiredSkills && task.requiredSkills.length > 0 && (
                                                            <div className="flex flex-wrap gap-2 mb-3">
                                                                {task.requiredSkills.map((skill, index) => (
                                                                    <span
                                                                        key={index}
                                                                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                                                    >
                                                                        {skill}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                                        {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <div className="text-sm text-gray-600">
                                                        <span className="font-medium">Reward:</span> 25 points
                                                    </div>
                                                    <button
                                                        onClick={() => handleClaimTask(task._id)}
                                                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                                                    >
                                                        Claim Task
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'my-tasks' && (
                            <div>
                                {myTasks.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="text-gray-400 text-6xl mb-4">📝</div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Tasks Claimed</h3>
                                        <p className="text-gray-600">Claim tasks from the "Open Tasks" tab to get started.</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {myTasks.map((task) => (
                                            <div key={task._id} className="bg-white rounded-lg shadow-md p-6">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                            {task.description}
                                                        </h3>
                                                        {task.disaster && (
                                                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                                                <span className="flex items-center">
                                                                    <span className="font-medium">Disaster:</span>
                                                                    <span className="ml-1">{task.disaster.title}</span>
                                                                </span>
                                                                <span className="flex items-center">
                                                                    <span className="font-medium">Location:</span>
                                                                    <span className="ml-1">{task.disaster.location}</span>
                                                                </span>
                                                            </div>
                                                        )}
                                                        {task.deadline && task.status === 'claimed' && (
                                                            <div className="text-sm text-orange-600 font-medium mb-2">
                                                                ⏰ {formatTimeRemaining(task.deadline)}
                                                            </div>
                                                        )}
                                                        {task.adminFeedback && (
                                                            <div className="mt-3 p-3 bg-gray-50 rounded-md">
                                                                <span className="font-medium text-gray-700">Admin Feedback:</span>
                                                                <p className="text-gray-600 mt-1">{task.adminFeedback}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                                        {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                                                    </span>
                                                </div>

                                                {task.status === 'claimed' && (
                                                    <div className="mt-4 space-y-3">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Submit Proof of Completion
                                                            </label>
                                                            <textarea
                                                                value={submissionData[task._id] || ''}
                                                                onChange={(e) => setSubmissionData(prev => ({
                                                                    ...prev,
                                                                    [task._id]: e.target.value
                                                                }))}
                                                                placeholder="Describe what you did, attach photos/documents, or provide other proof..."
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                rows={3}
                                                            />
                                                        </div>
                                                        <button
                                                            onClick={() => handleSubmitTask(task._id)}
                                                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                                                        >
                                                            Submit Task
                                                        </button>
                                                    </div>
                                                )}

                                                <div className="flex justify-between items-center mt-4">
                                                    <div className="text-sm text-gray-600">
                                                        <span className="font-medium">Reward:</span> 25 points
                                                        {task.status === 'approved' && (
                                                            <span className="ml-2 text-green-600 font-medium">✓ Earned!</span>
                                                        )}
                                                    </div>
                                                    {task.claimedAt && (
                                                        <div className="text-xs text-gray-500">
                                                            Claimed {new Date(task.claimedAt).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VolunteerTasks;
