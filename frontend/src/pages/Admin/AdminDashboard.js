import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    // Redirect if not admin
    useEffect(() => {
        if (user && user.role !== 'admin') {
            navigate('/');
            toast.error('Unauthorized access');
        }
    }, [user, navigate]);

    const adminFeatures = [
        {
            id: 'test-disaster',
            name: 'Test Disaster Panel',
            description: 'Raise test disaster alerts for system testing',
            icon: '🚨',
            link: '/admin/test',
            color: 'bg-red-100 text-red-800'
        },
        {
            id: 'crpf-notifications',
            name: 'CRPF Notifications',
            description: 'Manage extreme disaster notifications for CRPF',
            icon: '🔔',
            link: '/admin/crpf-notifications',
            color: 'bg-orange-100 text-orange-800'
        },
        {
            id: 'volunteer-verification',
            name: 'Volunteer Help Verification',
            description: 'Verify volunteer help logs and award points',
            icon: '✅',
            link: '/admin/volunteer-verification',
            color: 'bg-green-100 text-green-800'
        },
        {
            id: 'user-management',
            name: 'User Management',
            description: 'Manage users, roles and permissions',
            icon: '👥',
            link: '/admin/users',
            color: 'bg-blue-100 text-blue-800'
        },
        {
            id: 'analytics',
            name: 'Analytics Dashboard',
            description: 'View system analytics and statistics',
            icon: '📊',
            link: '/admin/analytics',
            color: 'bg-indigo-100 text-indigo-800'
        },
        {
            id: 'settings',
            name: 'System Settings',
            description: 'Configure system parameters and settings',
            icon: '⚙️',
            link: '/admin/settings',
            color: 'bg-purple-100 text-purple-800'
        }
    ];

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    Admin Access
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {adminFeatures.map((feature) => (
                    <Link 
                        key={feature.id}
                        to={feature.link}
                        className="block group"
                    >
                        <div className="h-full border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
                            <div className={`p-4 ${feature.color}`}>
                                <div className="text-3xl mb-2">{feature.icon}</div>
                                <h3 className="font-semibold text-lg">{feature.name}</h3>
                                <p className="text-sm mt-1 opacity-80">{feature.description}</p>
                            </div>
                            <div className="bg-white p-3 border-t">
                                <span className="text-sm font-medium text-blue-600 group-hover:text-blue-800 transition-colors flex items-center">
                                    Access
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button 
                        className="flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition-colors"
                        onClick={() => navigate('/admin/test')}
                    >
                        <span>Raise Test Alert</span>
                    </button>
                    <button className="flex items-center justify-center space-x-2 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md transition-colors">
                        <span>System Status</span>
                    </button>
                    <button className="flex items-center justify-center space-x-2 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md transition-colors">
                        <span>View Logs</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;