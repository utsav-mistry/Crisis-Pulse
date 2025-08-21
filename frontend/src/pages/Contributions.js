import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plus, Heart, Package, Clock, CheckCircle, Truck, Award, MapPin, Calendar, User } from 'lucide-react';
import ContributionForm from '../components/ContributionForm';
import api from '../services/api';
import toast from 'react-hot-toast';

const Contributions = () => {
    const { user } = useAuth();
    const [contributions, setContributions] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchContributions();
    }, []);

    const fetchContributions = async () => {
        try {
            if (!user || !user._id) return;
            const response = await api.get(`/contributions/user/${user._id}`);
            setContributions(response.data);
        } catch (error) {
            console.error('Error fetching contributions:', error);
        }
        setLoading(false);
    };

    const handleContributionSubmit = async (contributionData) => {
        try {
            const response = await api.post('/contribute', contributionData);
            setContributions(prev => [response.data, ...prev]);
            setShowForm(false);
            toast.success('Contribution submitted successfully! You earned 10 points.');
            // Refresh user data to update points
            window.location.reload();
        } catch (error) {
            console.error('Error submitting contribution:', error);
            toast.error('Failed to submit contribution');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'verified': return 'text-green-600 bg-green-50 border-green-200';
            case 'delivered': return 'text-blue-600 bg-blue-50 border-blue-200';
            default: return 'text-neutral-600 bg-neutral-50 border-neutral-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <Clock className="w-4 h-4" />;
            case 'verified': return <CheckCircle className="w-4 h-4" />;
            case 'delivered': return <Truck className="w-4 h-4" />;
            default: return <Package className="w-4 h-4" />;
        }
    };

    if (showForm) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900">Make Contribution</h1>
                        <p className="text-neutral-600">Help disaster victims by contributing resources</p>
                    </div>
                    <button 
                        onClick={() => setShowForm(false)}
                        className="btn btn-outline"
                    >
                        Back to List
                    </button>
                </div>
                <ContributionForm onSubmit={handleContributionSubmit} />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Enhanced Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">My Contributions</h1>
                        <p className="text-blue-100 text-lg">Track your disaster relief contributions and impact</p>
                        <div className="flex items-center mt-3 space-x-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-sm text-blue-100">Making a Difference</span>
                            </div>
                            <div className="text-sm text-blue-100">
                                Total Contributions: {contributions.length}
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <Link
                            to="/contribute"
                            className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-lg hover:bg-white/30 transition-all duration-200 flex items-center font-medium"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            New Contribution
                        </Link>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card">
                    <div className="card-body text-center">
                        <Heart className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-neutral-900">
                            {contributions.length}
                        </div>
                        <p className="text-sm text-neutral-600">Total Contributions</p>
                    </div>
                </div>
                <div className="card">
                    <div className="card-body text-center">
                        <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-neutral-900">
                            {contributions.filter(c => c.status === 'verified').length}
                        </div>
                        <p className="text-sm text-neutral-600">Verified</p>
                    </div>
                </div>
                <div className="card">
                    <div className="card-body text-center">
                        <Truck className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-neutral-900">
                            {contributions.filter(c => c.status === 'delivered').length}
                        </div>
                        <p className="text-sm text-neutral-600">Delivered</p>
                    </div>
                </div>
                <div className="card">
                    <div className="card-body text-center">
                        <Award className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-neutral-900">
                            {contributions.length * 10}
                        </div>
                        <p className="text-sm text-neutral-600">Points Earned</p>
                    </div>
                </div>
            </div>

            {/* Contributions List */}
            <div className="card">
                <div className="card-header">
                    <h3 className="text-lg font-semibold text-neutral-900">Contribution History</h3>
                </div>
                <div className="card-body">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                            <span className="ml-3 text-neutral-600">Loading contributions...</span>
                        </div>
                    ) : contributions.length === 0 ? (
                        <div className="text-center py-8">
                            <Heart className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-neutral-900 mb-2">No Contributions Yet</h3>
                            <p className="text-neutral-600 mb-4">Start making a difference by contributing to disaster relief efforts.</p>
                            <button 
                                onClick={() => setShowForm(true)}
                                className="btn btn-primary"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Make Your First Contribution
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {contributions.map((contribution) => (
                                <div key={contribution._id} className="p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-start space-x-3">
                                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                                <Heart className="w-5 h-5 text-primary-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-neutral-900">
                                                    Contribution to {contribution.disasterType} Relief
                                                </h4>
                                                <div className="flex items-center space-x-4 text-sm text-neutral-500 mt-1">
                                                    <div className="flex items-center space-x-1">
                                                        <MapPin className="w-3 h-3" />
                                                        <span>{contribution.deliveryInfo?.city}, {contribution.deliveryInfo?.state}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <Calendar className="w-3 h-3" />
                                                        <span>{new Date(contribution.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className={`badge ${getStatusColor(contribution.status)}`}>
                                                {getStatusIcon(contribution.status)}
                                                <span className="ml-1 capitalize">{contribution.status}</span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Items */}
                                    <div className="ml-13">
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {contribution.items?.map((item, index) => (
                                                <span key={index} className="px-2 py-1 bg-neutral-100 text-neutral-700 text-xs rounded">
                                                    {item.quantity} {item.name}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Contributor Info */}
                                        <div className="text-sm text-neutral-600">
                                            <div className="flex items-center space-x-1">
                                                <User className="w-3 h-3" />
                                                <span>By: {contribution.contributorInfo?.name}</span>
                                                <span>•</span>
                                                <span>{contribution.contributorInfo?.phone}</span>
                                            </div>
                                        </div>

                                        {contribution.status === 'delivered' && (
                                            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                                                ✅ Successfully delivered and verified by relief teams
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Contributions;