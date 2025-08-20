import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { User, MapPin, Phone, Mail, Award, TrendingUp, Shield, Edit3, Save, X, Calendar, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [userStats, setUserStats] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        location: { city: '', state: '' }
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                location: {
                    city: user.location?.city || '',
                    state: user.location?.state || ''
                }
            });
            fetchUserStats();
        }
    }, [user]);

    const fetchUserStats = async () => {
        try {
            const response = await fetch('/api/points/user', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setUserStats(data);
            }
        } catch (error) {
            console.error('Error fetching user stats:', error);
        }
    };

    const handleSave = async () => {
        try {
            const updatedData = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                location: {
                    city: formData.location.city,
                    state: formData.location.state
                }
            };

            const response = await axios.put('/api/users/me', updatedData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.status === 200) {
                const updatedUser = response.data;
                updateUser(updatedUser);
                setIsEditing(false);
                toast.success('Profile updated successfully!');
            } else {
                toast.error(response.data?.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error(error.response?.data?.message || 'Failed to update profile');
        }
    };

    const handleCancel = () => {
        setFormData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            location: {
                city: user.location?.city || '',
                state: user.location?.state || ''
            }
        });
        setIsEditing(false);
    };

    const getRoleBadge = (role) => {
        const badges = {
            admin: { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Shield },
            volunteer: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Award },
            user: { color: 'bg-green-100 text-green-800 border-green-200', icon: User }
        };
        const badge = badges[role] || badges.user;
        const Icon = badge.icon;
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${badge.color}`}>
                <Icon className="w-4 h-4 mr-1" />
                {role?.charAt(0).toUpperCase() + role?.slice(1)}
            </span>
        );
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">My Profile</h1>
                    <p className="text-neutral-600">Manage your account and preferences</p>
                </div>
                {!isEditing ? (
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="btn btn-outline"
                    >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit Profile
                    </button>
                ) : (
                    <div className="flex space-x-2">
                        <button 
                            onClick={handleSave}
                            className="btn btn-primary"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                        </button>
                        <button 
                            onClick={handleCancel}
                            className="btn btn-outline"
                        >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                        </button>
                    </div>
                )}
            </div>

            {/* Profile Information */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Profile Card */}
                <div className="lg:col-span-2">
                    <div className="card">
                        <div className="card-header">
                            <h3 className="text-lg font-semibold text-neutral-900">Profile Information</h3>
                        </div>
                        <div className="card-body">
                            <div className="flex items-center space-x-4 mb-6">
                                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                                    <User className="w-8 h-8 text-primary-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-neutral-900">{user.name}</h2>
                                    <div className="flex items-center space-x-2 mt-1">
                                        {getRoleBadge(user.role)}
                                        {userStats && (
                                            <span className="text-sm text-neutral-600">
                                                {userStats.points} points
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                                            Full Name
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                                className="input"
                                                placeholder="Enter your full name"
                                            />
                                        ) : (
                                            <div className="flex items-center space-x-2 text-neutral-900">
                                                <User className="w-4 h-4 text-neutral-500" />
                                                <span>{user.name || 'Not provided'}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                                            Email Address
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                                className="input"
                                                placeholder="Enter your email"
                                            />
                                        ) : (
                                            <div className="flex items-center space-x-2 text-neutral-900">
                                                <Mail className="w-4 h-4 text-neutral-500" />
                                                <span>{user.email}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                                            Phone Number
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                                className="input"
                                                placeholder="Enter your phone number"
                                            />
                                        ) : (
                                            <div className="flex items-center space-x-2 text-neutral-900">
                                                <Phone className="w-4 h-4 text-neutral-500" />
                                                <span>{user.phone || 'Not provided'}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                                            Member Since
                                        </label>
                                        <div className="flex items-center space-x-2 text-neutral-900">
                                            <Calendar className="w-4 h-4 text-neutral-500" />
                                            <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Not available'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                                            City
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={formData.location.city}
                                                onChange={(e) => setFormData(prev => ({ 
                                                    ...prev, 
                                                    location: { ...prev.location, city: e.target.value }
                                                }))}
                                                className="input"
                                                placeholder="Enter your city"
                                            />
                                        ) : (
                                            <div className="flex items-center space-x-2 text-neutral-900">
                                                <MapPin className="w-4 h-4 text-neutral-500" />
                                                <span>{user.location?.city || 'Not provided'}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                                            State
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={formData.location.state}
                                                onChange={(e) => setFormData(prev => ({ 
                                                    ...prev, 
                                                    location: { ...prev.location, state: e.target.value }
                                                }))}
                                                className="input"
                                                placeholder="Enter your state"
                                            />
                                        ) : (
                                            <div className="flex items-center space-x-2 text-neutral-900">
                                                <MapPin className="w-4 h-4 text-neutral-500" />
                                                <span>{user.location?.state || 'Not provided'}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Sidebar */}
                <div className="space-y-6">
                    {/* Points & Stats */}
                    {userStats && (
                        <div className="card">
                            <div className="card-header">
                                <h3 className="text-lg font-semibold text-neutral-900 flex items-center">
                                    <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                                    Your Stats
                                </h3>
                            </div>
                            <div className="card-body">
                                <div className="space-y-4">
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-primary-600">{userStats.points}</div>
                                        <p className="text-sm text-neutral-600">Total Points</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-center">
                                        <div>
                                            <div className="text-xl font-bold text-neutral-900">{userStats.contributions || 0}</div>
                                            <p className="text-xs text-neutral-600">Contributions</p>
                                        </div>
                                        <div>
                                            <div className="text-xl font-bold text-neutral-900">{userStats.helpLogs || 0}</div>
                                            <p className="text-xs text-neutral-600">Help Logs</p>
                                        </div>
                                    </div>
                                    {userStats.achievements && userStats.achievements.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-medium text-neutral-700 mb-2">Achievements</h4>
                                            <div className="flex flex-wrap gap-1">
                                                {userStats.achievements.slice(0, 3).map((achievement, index) => (
                                                    <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                                                        {achievement}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Role Information */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="text-lg font-semibold text-neutral-900">Role & Permissions</h3>
                        </div>
                        <div className="card-body">
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-neutral-600 mb-2">Current Role</p>
                                    {getRoleBadge(user.role)}
                                </div>
                                <div className="text-sm text-neutral-600">
                                    {user.role === 'admin' && 'Full system access including disaster management and CRPF notifications.'}
                                    {user.role === 'volunteer' && 'Can log volunteer help, sign up for opportunities, and earn points.'}
                                    {user.role === 'user' && 'Can contribute resources, view disasters, and participate in the community.'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;