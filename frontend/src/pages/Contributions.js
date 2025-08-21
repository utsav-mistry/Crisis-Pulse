import React, { useState, useEffect } from 'react';
import { Heart, Gift, Award, Plus, MapPin, Calendar, Package, Truck, CheckCircle, Clock, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ContributionForm from '../components/ContributionForm';
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
            const response = await fetch(`/api/contributions/user/${user._id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setContributions(data);
            }
        } catch (error) {
            console.error('Error fetching contributions:', error);
        }
        setLoading(false);
    };

    const handleContributionSubmit = async (contributionData) => {
        try {
            const response = await fetch('/api/contributions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(contributionData)
            });

            if (response.ok) {
                const newContribution = await response.json();
                setContributions(prev => [newContribution, ...prev]);
                setShowForm(false);
                toast.success('Contribution submitted successfully! You earned 10 points.');
                // Refresh user data to update points
                window.location.reload();
            } else {
                const error = await response.json();
                toast.error(error.message || 'Failed to submit contribution');
            }
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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">My Contributions</h1>
                    <p className="text-neutral-600">Track your contributions and earn points</p>
                </div>
                <button 
                    onClick={() => setShowForm(true)}
                    className="btn btn-primary"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Make Contribution
                </button>
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