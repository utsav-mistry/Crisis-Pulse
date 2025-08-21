import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Shield, Lock, CheckCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminSetup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        adminKey: ''
    });
    const [loading, setLoading] = useState(false);
    const [setupStatus, setSetupStatus] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showAdminKey, setShowAdminKey] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        checkSetupStatus();
    }, []);

    const checkSetupStatus = async () => {
        try {
            const response = await axios.get('/api/setup/status');
            setSetupStatus(response.data);
            
            if (response.data.adminExists) {
                toast.success('Admin already exists. Redirecting to login...');
                setTimeout(() => navigate('/login'), 2000);
            }
        } catch (error) {
            console.error('Error checking setup status:', error);
            toast.error('Failed to check setup status');
        }
    };

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            toast.error('Name is required');
            return false;
        }
        if (!formData.email.trim()) {
            toast.error('Email is required');
            return false;
        }
        if (!formData.password) {
            toast.error('Password is required');
            return false;
        }
        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return false;
        }
        if (!formData.adminKey.trim()) {
            toast.error('Admin creation key is required');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setLoading(true);
        try {
            const response = await axios.post('/api/setup/admin', {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                adminKey: formData.adminKey
            });

            toast.success('Admin created successfully!');
            
            // Store the token
            localStorage.setItem('token', response.data.token);
            
            // Redirect to admin dashboard
            setTimeout(() => {
                navigate('/app/admin/dashboard');
            }, 1500);

        } catch (error) {
            const message = error.response?.data?.message || 'Failed to create admin';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    if (setupStatus?.adminExists) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-neutral-900 mb-2">Admin Already Exists</h2>
                    <p className="text-neutral-600 mb-6">
                        An admin account has already been created. Redirecting to login...
                    </p>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-emergency-600 rounded-lg flex items-center justify-center">
                            <Shield className="w-10 h-10 text-white" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-neutral-900">Crisis Pulse</h2>
                    <p className="mt-2 text-sm text-neutral-600">Admin Setup</p>
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                            <p className="text-sm text-yellow-800">
                                One-time admin creation. This will be locked after first admin is created.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Setup Form */}
                <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                Full Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="Enter admin name"
                                required
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                Email Address *
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="Enter admin email"
                                required
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                Password *
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pr-10 px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    placeholder="Enter password (min 6 characters)"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                Confirm Password *
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full pr-10 px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    placeholder="Confirm password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600"
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Admin Key */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                Admin Creation Key *
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                                <input
                                    type={showAdminKey ? "text" : "password"}
                                    name="adminKey"
                                    value={formData.adminKey}
                                    onChange={handleChange}
                                    className="pl-10 pr-10 w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    placeholder="Enter admin creation key"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowAdminKey(!showAdminKey)}
                                    className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600"
                                >
                                    {showAdminKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            <p className="mt-1 text-xs text-neutral-500">
                                Contact system administrator for the admin creation key
                            </p>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Creating Admin...
                                </div>
                            ) : (
                                'Create Admin Account'
                            )}
                        </button>

                        {/* Info */}
                        <div className="text-center">
                            <p className="text-sm text-neutral-600">
                                Already have an admin account?{' '}
                                <button
                                    type="button"
                                    onClick={() => navigate('/login')}
                                    className="text-primary-600 hover:text-primary-500 font-medium"
                                >
                                    Sign in here
                                </button>
                            </p>
                        </div>
                    </form>
                </div>

                {/* Setup Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-blue-900 mb-2">Setup Information</h3>
                    <ul className="text-xs text-blue-800 space-y-1">
                        <li>• This is a one-time setup process</li>
                        <li>• Admin creation will be locked after first admin</li>
                        <li>• Use a strong password for security</li>
                        <li>• Admin key is required for security</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AdminSetup;
