import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    Home,
    AlertTriangle,
    TrendingUp,
    Heart,
    Bell,
    User,
    Menu,
    X,
    LogOut,
    Shield,
    MapPin,
    Activity
} from 'lucide-react';
import toast from 'react-hot-toast';

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Logged out successfully');
            navigate('/login');
        } catch (error) {
            toast.error('Logout failed');
        }
    };

    const navigation = [
        { name: 'Dashboard', href: '/', icon: Home },
        { name: 'Disasters', href: '/disasters', icon: AlertTriangle },
        { name: 'Predictions', href: '/predictions', icon: TrendingUp },
        { name: 'Contributions', href: '/contributions', icon: Heart },
        { name: 'Alerts', href: '/alerts', icon: Bell },
        { name: 'Profile', href: '/profile', icon: User },
    ];

    const getRoleBadge = (role) => {
        const roleConfig = {
            volunteer: { color: 'badge-safety', text: 'Volunteer' },
            crpf: { color: 'badge-warning', text: 'CRPF' },
            admin: { color: 'badge-emergency', text: 'Admin' },
        };
        const config = roleConfig[role] || { color: 'badge-neutral', text: role };
        return <span className={`badge ${config.color}`}>{config.text}</span>;
    };

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-neutral-900 bg-opacity-50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-neutral-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-neutral-200">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-emergency-600 rounded-sharp flex items-center justify-center">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-neutral-900">Crisis Pulse</h1>
                                <p className="text-xs text-neutral-500">Disaster Response</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-1 rounded-sharp hover:bg-neutral-100"
                        >
                            <X className="w-5 h-5 text-neutral-500" />
                        </button>
                    </div>

                    {/* User Info */}
                    <div className="p-4 border-b border-neutral-200">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary-100 rounded-sharp flex items-center justify-center">
                                <User className="w-5 h-5 text-primary-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-neutral-900 truncate">
                                    {user?.name || 'User'}
                                </p>
                                <p className="text-xs text-neutral-500 truncate">
                                    {user?.email}
                                </p>
                                <div className="mt-1">
                                    {getRoleBadge(user?.role)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2">
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`nav-link flex items-center space-x-3 w-full ${isActive ? 'nav-link-active' : ''
                                        }`}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-neutral-200">
                        <button
                            onClick={handleLogout}
                            className="nav-link flex items-center space-x-3 w-full text-emergency-600 hover:text-emergency-700 hover:bg-emergency-50"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Top bar */}
                <div className="sticky top-0 z-30 bg-white border-b border-neutral-200">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 rounded-sharp hover:bg-neutral-100"
                            >
                                <Menu className="w-5 h-5 text-neutral-500" />
                            </button>
                            <div className="flex items-center space-x-2">
                                <MapPin className="w-4 h-4 text-neutral-400" />
                                <span className="text-sm text-neutral-600">
                                    {user?.location?.city || 'Location not set'}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* Status indicator */}
                            <div className="flex items-center space-x-2">
                                <div className="status-dot status-dot-online"></div>
                                <span className="text-xs text-neutral-500">Online</span>
                            </div>

                            {/* Points display */}
                            <div className="flex items-center space-x-2 px-3 py-1 bg-safety-50 border border-safety-200 rounded-sharp">
                                <Activity className="w-4 h-4 text-safety-600" />
                                <span className="text-sm font-medium text-safety-700">
                                    {user?.points || 0} pts
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Page content */}
                <main className="p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout; 