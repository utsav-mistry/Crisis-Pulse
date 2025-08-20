import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Search, Filter, Check, X, Ban, UserCheck, AlertTriangle, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        role: 'all',
        status: 'all',
        search: '',
        page: 1,
        limit: 10
    });
    const [stats, setStats] = useState({
        pending: 0,
        approved: 0,
        rejected: 0,
        suspended: 0,
        total: 0
    });
    const [totalPages, setTotalPages] = useState(1);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    useEffect(() => {
        fetchUsers();
        fetchVolunteerStats();
    }, [filters]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            Object.keys(filters).forEach(key => {
                if (filters[key] && filters[key] !== 'all') {
                    params.append(key, filters[key]);
                }
            });

            const response = await axios.get(`/api/admin/users?${params}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            setUsers(response.data.users);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const fetchVolunteerStats = async () => {
        try {
            const response = await axios.get('/api/admin/volunteers/stats', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching volunteer stats:', error);
        }
    };

    const handleApproveVolunteer = async (userId) => {
        try {
            await axios.patch(`/api/admin/volunteers/${userId}/approve`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            toast.success('Volunteer approved successfully');
            fetchUsers();
            fetchVolunteerStats();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to approve volunteer');
        }
    };

    const handleRejectVolunteer = async () => {
        if (!selectedUser || !rejectReason.trim()) {
            toast.error('Please provide a rejection reason');
            return;
        }

        try {
            await axios.patch(`/api/admin/volunteers/${selectedUser._id}/reject`, {
                reason: rejectReason
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            toast.success('Volunteer rejected successfully');
            setShowRejectModal(false);
            setRejectReason('');
            setSelectedUser(null);
            fetchUsers();
            fetchVolunteerStats();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reject volunteer');
        }
    };

    const handleSuspendVolunteer = async (userId, reason = 'Suspended by admin') => {
        try {
            await axios.patch(`/api/admin/volunteers/${userId}/suspend`, {
                reason
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            toast.success('Volunteer suspended successfully');
            fetchUsers();
            fetchVolunteerStats();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to suspend volunteer');
        }
    };

    const handleBanUser = async (userId, reason = 'Banned by admin') => {
        try {
            await axios.patch(`/api/admin/users/${userId}/ban`, {
                reason
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            toast.success('User ban status updated');
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update user ban status');
        }
    };

    const getStatusBadge = (user) => {
        if (!user.isActive) {
            return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Banned</span>;
        }
        
        if (user.role === 'volunteer') {
            const statusColors = {
                pending: 'bg-yellow-100 text-yellow-800',
                approved: 'bg-green-100 text-green-800',
                rejected: 'bg-red-100 text-red-800',
                suspended: 'bg-gray-100 text-gray-800'
            };
            return (
                <span className={`px-2 py-1 text-xs rounded-full ${statusColors[user.volunteerStatus] || 'bg-gray-100 text-gray-800'}`}>
                    {user.volunteerStatus || 'Unknown'}
                </span>
            );
        }
        
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Active</span>;
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'admin': return <Shield className="w-4 h-4 text-red-600" />;
            case 'volunteer': return <Users className="w-4 h-4 text-blue-600" />;
            default: return <UserCheck className="w-4 h-4 text-gray-600" />;
        }
    };

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-neutral-900 mb-2">User Management</h1>
                <p className="text-neutral-600">Manage users, volunteers, and their permissions</p>
            </div>

            {/* Volunteer Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <div className="card">
                    <div className="card-body text-center">
                        <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                        <div className="text-sm text-neutral-600">Pending</div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-body text-center">
                        <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                        <div className="text-sm text-neutral-600">Approved</div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-body text-center">
                        <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                        <div className="text-sm text-neutral-600">Rejected</div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-body text-center">
                        <div className="text-2xl font-bold text-gray-600">{stats.suspended}</div>
                        <div className="text-sm text-neutral-600">Suspended</div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-body text-center">
                        <div className="text-2xl font-bold text-primary-600">{stats.total}</div>
                        <div className="text-sm text-neutral-600">Total Volunteers</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card mb-6">
                <div className="card-body">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                                className="pl-10 w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        
                        <select
                            value={filters.role}
                            onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value, page: 1 }))}
                            className="px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="all">All Roles</option>
                            <option value="user">Users</option>
                            <option value="volunteer">Volunteers</option>
                            <option value="admin">Admins</option>
                        </select>

                        {filters.role === 'volunteer' && (
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                                className="px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="all">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="suspended">Suspended</option>
                            </select>
                        )}

                        <button
                            onClick={fetchUsers}
                            className="btn btn-primary"
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            Apply Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="card">
                <div className="card-header">
                    <h3 className="text-lg font-semibold">Users</h3>
                </div>
                <div className="card-body p-0">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                            <p className="mt-2 text-neutral-600">Loading users...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-neutral-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Joined</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-neutral-200">
                                    {users.map((user) => (
                                        <tr key={user._id} className="hover:bg-neutral-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                                            {getRoleIcon(user.role)}
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-neutral-900">{user.name}</div>
                                                        <div className="text-sm text-neutral-500">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 py-1 text-xs rounded-full bg-neutral-100 text-neutral-800 capitalize">
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(user)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    {user.role === 'volunteer' && user.volunteerStatus === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApproveVolunteer(user._id)}
                                                                className="text-green-600 hover:text-green-900"
                                                                title="Approve Volunteer"
                                                            >
                                                                <Check className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedUser(user);
                                                                    setShowRejectModal(true);
                                                                }}
                                                                className="text-red-600 hover:text-red-900"
                                                                title="Reject Volunteer"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                    
                                                    {user.role === 'volunteer' && user.volunteerStatus === 'approved' && (
                                                        <button
                                                            onClick={() => handleSuspendVolunteer(user._id)}
                                                            className="text-yellow-600 hover:text-yellow-900"
                                                            title="Suspend Volunteer"
                                                        >
                                                            <AlertTriangle className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    
                                                    {user.role !== 'admin' && (
                                                        <button
                                                            onClick={() => handleBanUser(user._id)}
                                                            className={`${user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                                                            title={user.isActive ? 'Ban User' : 'Unban User'}
                                                        >
                                                            <Ban className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                    <div className="flex space-x-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => setFilters(prev => ({ ...prev, page }))}
                                className={`px-3 py-2 rounded-md ${
                                    filters.page === page
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Reject Volunteer Application</h3>
                        <p className="text-neutral-600 mb-4">
                            Please provide a reason for rejecting {selectedUser?.name}'s volunteer application:
                        </p>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Enter rejection reason..."
                        />
                        <div className="flex space-x-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectReason('');
                                    setSelectedUser(null);
                                }}
                                className="flex-1 btn btn-outline"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRejectVolunteer}
                                className="flex-1 btn btn-danger"
                            >
                                Reject Application
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
