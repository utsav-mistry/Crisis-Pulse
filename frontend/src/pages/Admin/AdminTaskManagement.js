import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminTaskManagement = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [disasters, setDisasters] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newTask, setNewTask] = useState({
        disaster: '',
        description: '',
        requiredSkills: ''
    });

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchTasks();
            fetchDisasters();
        }
    }, [user]);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await api.get('/volunteer-tasks/admin');
            setTasks(response.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            toast.error('Failed to load tasks');
        } finally {
            setLoading(false);
        }
    };

    const fetchDisasters = async () => {
        try {
            const response = await api.get('/disasters');
            setDisasters(response.data);
        } catch (error) {
            console.error('Error fetching disasters:', error);
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        if (!newTask.disaster || !newTask.description) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            const taskData = {
                ...newTask,
                requiredSkills: newTask.requiredSkills.split(',').map(skill => skill.trim()).filter(Boolean)
            };

            await api.post('/volunteer-tasks', taskData);
            toast.success('Task created successfully');
            setNewTask({ disaster: '', description: '', requiredSkills: '' });
            setShowCreateForm(false);
            fetchTasks();
        } catch (error) {
            console.error('Error creating task:', error);
            toast.error(error.response?.data?.message || 'Failed to create task');
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

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (user?.role !== 'admin') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
                    <p className="text-gray-600 mt-2">This page is only accessible to administrators.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
                        <p className="text-gray-600 mt-2">
                            Create and manage volunteer tasks for disaster response.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Create New Task
                    </button>
                </div>

                {/* Create Task Modal */}
                {showCreateForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <h2 className="text-xl font-bold mb-4">Create New Task</h2>
                            <form onSubmit={handleCreateTask} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Disaster *
                                    </label>
                                    <select
                                        value={newTask.disaster}
                                        onChange={(e) => setNewTask(prev => ({ ...prev, disaster: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Select a disaster</option>
                                        {disasters.map((disaster) => (
                                            <option key={disaster._id} value={disaster._id}>
                                                {disaster.title} - {disaster.location.city}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Task Description *
                                    </label>
                                    <textarea
                                        value={newTask.description}
                                        onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Describe what volunteers need to do..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={3}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Required Skills (comma-separated)
                                    </label>
                                    <input
                                        type="text"
                                        value={newTask.requiredSkills}
                                        onChange={(e) => setNewTask(prev => ({ ...prev, requiredSkills: e.target.value }))}
                                        placeholder="e.g., First Aid, Heavy Lifting, Medical Training"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="flex space-x-3 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        Create Task
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateForm(false)}
                                        className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Tasks List */}
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">All Tasks ({tasks.length})</h2>
                        </div>
                        {tasks.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-gray-400 text-6xl mb-4">📋</div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No Tasks Created</h3>
                                <p className="text-gray-600">Create your first volunteer task to get started.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Task
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Disaster
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Volunteer
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Created
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Deadline
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {tasks.map((task) => (
                                            <tr key={task._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {task.description}
                                                        </div>
                                                        {task.requiredSkills && task.requiredSkills.length > 0 && (
                                                            <div className="flex flex-wrap gap-1 mt-1">
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
                                                </td>
                                                <td className="px-6 py-4">
                                                    {task.disaster && (
                                                        <div className="text-sm text-gray-900">
                                                            <div className="font-medium">{task.disaster.title}</div>
                                                            <div className="text-gray-500">{task.disaster.location}</div>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                                        {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {task.volunteer ? (
                                                        <div>
                                                            <div className="font-medium">{task.volunteer.name}</div>
                                                            <div className="text-gray-500">{task.volunteer.email}</div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-500">Unassigned</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {formatDate(task.createdAt)}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {task.deadline ? formatDate(task.deadline) : 'Not set'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminTaskManagement;
