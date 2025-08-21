import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Shield, User, Mail, Lock, Phone, MapPin, Users, UserCheck, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, register } = useAuth();

    // Redirect if user is already logged in
    useEffect(() => {
        if (isAuthenticated && user) {
            if (user.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/dashboard');
            }
        }
    }, [isAuthenticated, user, navigate]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        role: 'user',
        location: {
            city: '',
            state: ''
        },
        crpfId: '',
        volunteerExperience: '',
        motivation: ''
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('location.')) {
            const locationField = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                location: {
                    ...prev.location,
                    [locationField]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleRoleChange = (role) => {
        setFormData(prev => ({ ...prev, role }));
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
        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return false;
        }
        if (formData.role === 'volunteer' && !formData.motivation.trim()) {
            toast.error('Please explain your motivation to volunteer');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setLoading(true);
        try {
            const registrationData = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                role: formData.role,
                location: formData.location,
                ...(formData.role === 'volunteer' && { 
                    volunteerExperience: formData.volunteerExperience,
                    motivation: formData.motivation
                })
            };

            await register(registrationData);
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'user': return <User className="w-5 h-5" />;
            case 'volunteer': return <Users className="w-5 h-5" />;
            case 'crpf': return <Shield className="w-5 h-5" />;
            default: return <User className="w-5 h-5" />;
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl w-full space-y-8">
                <div className="text-center">
                    <div className="flex justify-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h2 className="mt-6 text-3xl font-bold text-neutral-900">
                        Join Crisis Pulse
                    </h2>
                    <p className="mt-2 text-sm text-neutral-600">
                        Create your account to help build a safer community
                    </p>
                </div>

                <div className="card">
                    <div className="card-body">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                                        Full Name *
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="pl-10 w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            placeholder="Enter your full name"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                                        Email Address *
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="pl-10 w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            placeholder="Enter your email"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                                        Password *
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="pl-10 pr-10 w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            placeholder="Create a password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                                        Confirm Password *
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="pl-10 pr-10 w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            placeholder="Confirm your password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600"
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                                        Phone Number
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="pl-10 w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            placeholder="Enter your phone number"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Location */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                                        City
                                    </label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
                                        <input
                                            type="text"
                                            name="location.city"
                                            value={formData.location.city}
                                            onChange={handleChange}
                                            className="pl-10 w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            placeholder="Enter your city"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                                        State
                                    </label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
                                        <input
                                            type="text"
                                            name="location.state"
                                            value={formData.location.state}
                                            onChange={handleChange}
                                            className="pl-10 w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            placeholder="Enter your state"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Role Selection */}
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-4">
                                    Select Your Role *
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {['user', 'volunteer'].map((role) => (
                                        <div
                                            key={role}
                                            onClick={() => handleRoleChange(role)}
                                            className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${
                                                formData.role === role
                                                    ? 'border-primary-500 bg-primary-50'
                                                    : 'border-neutral-200 hover:border-neutral-300'
                                            }`}
                                        >
                                            <div className="flex items-center justify-center mb-2">
                                                {getRoleIcon(role)}
                                            </div>
                                            <h3 className="text-sm font-medium text-center capitalize mb-1">
                                                {role}
                                            </h3>
                                            <p className="text-xs text-neutral-600 text-center">
                                                {role === 'user' && 'Report disasters and contribute resources'}
                                                {role === 'volunteer' && 'Help during disasters (requires approval)'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Additional Fields for Volunteer */}
                            {formData.role === 'volunteer' && (
                                <div className="space-y-6 border-t pt-6">
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                                            Previous Volunteer Experience
                                        </label>
                                        <textarea
                                            name="volunteerExperience"
                                            value={formData.volunteerExperience}
                                            onChange={handleChange}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            placeholder="Describe any previous volunteer experience (optional)"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                                            Why do you want to volunteer? *
                                        </label>
                                        <textarea
                                            name="motivation"
                                            value={formData.motivation}
                                            onChange={handleChange}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            placeholder="Tell us about your motivation to help during disasters"
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Creating Account...' : 'Create Account'}
                                </button>
                            </div>

                            <div className="text-center">
                                <p className="text-sm text-neutral-600">
                                    Already have an account?{' '}
                                    <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                                        Sign in here
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;