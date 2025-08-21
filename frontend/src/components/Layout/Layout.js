import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    Home,
    AlertTriangle,
    Shield,
    Users,
    Heart,
    LogOut,
    Menu,
    X,
    Bell,
    User,
    Activity,
    UserCheck,
    CheckSquare,
    Trophy,
    FileText,
    ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import NotificationBell from './NotificationBell';

const Layout = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
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

    // Navigation categories with dropdowns
    const getNavigationCategories = () => {
        const categories = [
            {
                name: 'Dashboard',
                path: '/app/dashboard',
                icon: Home,
                single: true
            },
            {
                name: 'Disasters',
                icon: AlertTriangle,
                items: [
                    { name: 'Live Feed', path: '/app/disaster-feed', icon: Activity },
                    { name: 'Safety Center', path: '/app/safety-center', icon: Shield },
                ]
            },
            {
                name: 'Community',
                icon: Users,
                items: [
                    ...(user?.role === 'user' || user?.role === 'volunteer' ? [{ name: 'Contributions', path: '/app/contributions', icon: Heart }] : []),
                    { name: 'Leaderboard', path: '/app/leaderboard', icon: Trophy },
                ]
            }
        ];

        // Add admin category
        if (user?.role === 'admin') {
            categories.push({
                name: 'Admin',
                icon: Shield,
                items: [
                    { name: 'Admin Dashboard', path: '/app/admin/dashboard', icon: Shield },
                    { name: 'Test Panel', path: '/app/admin/test-panel', icon: Activity },
                    { name: 'Test Logs', path: '/app/admin/test-logs', icon: FileText },
                    { name: 'Room Management', path: '/app/admin/room-management', icon: Users },
                    { name: 'Public Notifications', path: '/app/admin/public-notifications', icon: Bell },
                    { name: 'Profile', path: '/app/profile', icon: User },
                    { name: 'CRPF Notifications', path: '/app/admin/crpf-notifications', icon: Bell },
                    { name: 'Volunteer Verification', path: '/app/admin/volunteer-verification', icon: UserCheck },
                    { name: 'Task Verification', path: '/app/admin/task-verification', icon: UserCheck },
                    { name: 'Task Management', path: '/app/admin/task-management', icon: CheckSquare },
                ]
            });
        }

        // Add volunteer category
        if (user?.role === 'volunteer') {
            categories.push({
                name: 'Volunteer',
                icon: Heart,
                items: [
                    { name: 'Volunteer Dashboard', path: '/app/volunteer/dashboard', icon: Activity },
                    { name: 'Tasks', path: '/app/volunteer/tasks', icon: CheckSquare },
                    { name: 'Log Help', path: '/app/volunteer/log-help', icon: Heart },
                ]
            });
        }


        return categories;
    };

    const navigationCategories = getNavigationCategories();
    const [openDropdown, setOpenDropdown] = useState(null);

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'admin':
                return 'bg-red-100 text-red-800';
            case 'volunteer':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-blue-100 text-blue-800';
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Horizontal Navigation Bar */}
            <nav className="sticky top-0 z-50 bg-white border-b border-neutral-200 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-md">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <div className="hidden sm:block">
                                <h1 className="text-xl font-bold text-neutral-900">Crisis Pulse</h1>
                                <p className="text-xs text-neutral-500 -mt-1">Disaster Management</p>
                            </div>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center space-x-1">
                            {navigationCategories.map((category) => {
                                const Icon = category.icon;
                                
                                // Single item (no dropdown)
                                if (category.single) {
                                    const isActive = location.pathname === category.path;
                                    return (
                                        <Link
                                            key={category.path}
                                            to={category.path}
                                            className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                                                isActive
                                                    ? 'bg-red-50 text-red-700 border border-red-200 shadow-sm'
                                                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 hover:shadow-sm'
                                            }`}
                                        >
                                            <Icon className="w-4 h-4 mr-2" />
                                            <span className="whitespace-nowrap">{category.name}</span>
                                        </Link>
                                    );
                                }

                                // Dropdown category
                                const isDropdownActive = category.items?.some(item => 
                                    location.pathname === item.path || 
                                    (item.path !== '/' && location.pathname.startsWith(item.path))
                                );
                                
                                return (
                                    <div key={category.name} className="relative">
                                        <button
                                            onClick={() => setOpenDropdown(openDropdown === category.name ? null : category.name)}
                                            className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                                                isDropdownActive
                                                    ? 'bg-red-50 text-red-700 border border-red-200 shadow-sm'
                                                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 hover:shadow-sm'
                                            }`}
                                        >
                                            <Icon className="w-4 h-4 mr-2" />
                                            <span className="whitespace-nowrap">{category.name}</span>
                                            <ChevronDown className={`w-4 h-4 ml-1 transition-transform duration-200 ${
                                                openDropdown === category.name ? 'rotate-180' : ''
                                            }`} />
                                        </button>

                                        {/* Dropdown Menu */}
                                        {openDropdown === category.name && (
                                            <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-neutral-200 py-2 z-50">
                                                {category.items?.map((item) => {
                                                    const ItemIcon = item.icon;
                                                    const isActive = location.pathname === item.path ||
                                                        (item.path !== '/' && location.pathname.startsWith(item.path));
                                                    
                                                    return (
                                                        <Link
                                                            key={item.path}
                                                            to={item.path}
                                                            className={`flex items-center px-4 py-3 text-sm font-medium transition-all duration-200 ${
                                                                isActive
                                                                    ? 'bg-red-50 text-red-700 border-r-2 border-red-600'
                                                                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                                                            }`}
                                                            onClick={() => setOpenDropdown(null)}
                                                        >
                                                            <ItemIcon className="w-4 h-4 mr-3" />
                                                            {item.name}
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* User Menu & Mobile Menu Button */}
                        <div className="flex items-center space-x-4">
                            {user && <NotificationBell />}
                            {/* User Menu */}
                            {user && (
                                <div className="relative">
                                    <button
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                        className="flex items-center space-x-3 p-2 rounded-xl hover:bg-neutral-50 transition-all duration-200 border border-transparent hover:border-neutral-200"
                                    >
                                        <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                                            <User className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="hidden md:block text-left">
                                            <p className="text-sm font-semibold text-neutral-900">{user.name}</p>
                                            <div className="flex items-center space-x-2">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                                                    {user.role}
                                                </span>
                                                <span className="text-xs text-neutral-500">{user.points || 0} pts</span>
                                            </div>
                                        </div>
                                        <ChevronDown className="w-4 h-4 text-neutral-400" />
                                    </button>

                                    {/* User Dropdown */}
                                    {userMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-50">
                                            <div className="px-4 py-2 border-b border-neutral-200">
                                                <p className="text-sm font-medium text-neutral-900">{user.name}</p>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                                                        {user.role}
                                                    </span>
                                                    <span className="text-xs text-neutral-500">{user.points || 0} pts</span>
                                                </div>
                                            </div>
                                            <Link
                                                to="/profile"
                                                className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                                                onClick={() => setUserMenuOpen(false)}
                                            >
                                                <User className="w-4 h-4 mr-2" />
                                                Profile
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    handleLogout();
                                                    setUserMenuOpen(false);
                                                }}
                                                className="flex items-center w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                                            >
                                                <LogOut className="w-4 h-4 mr-2" />
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="lg:hidden p-2 rounded-xl text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50 border border-transparent hover:border-neutral-200 transition-all duration-200"
                            >
                                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Navigation Menu */}
                    {mobileMenuOpen && (
                        <div className="lg:hidden border-t border-neutral-200 py-3 bg-neutral-50">
                            <div className="space-y-2 px-4">
                                {navigationCategories.map((category) => {
                                    // Single item (no dropdown in mobile)
                                    if (category.single) {
                                        const Icon = category.icon;
                                        const isActive = location.pathname === category.path;
                                        return (
                                            <Link
                                                key={category.path}
                                                to={category.path}
                                                className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                                                    isActive
                                                        ? 'bg-red-50 text-red-700 border border-red-200 shadow-sm'
                                                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-white hover:shadow-sm border border-transparent'
                                                }`}
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                <Icon className="w-5 h-5 mr-3" />
                                                {category.name}
                                            </Link>
                                        );
                                    }

                                    // Category items (flatten for mobile)
                                    return category.items?.map((item) => {
                                        const Icon = item.icon;
                                        const isActive = location.pathname === item.path ||
                                            (item.path !== '/' && location.pathname.startsWith(item.path));

                                        return (
                                            <Link
                                                key={item.path}
                                                to={item.path}
                                                className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                                                    isActive
                                                        ? 'bg-red-50 text-red-700 border border-red-200 shadow-sm'
                                                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-white hover:shadow-sm border border-transparent'
                                                }`}
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                <Icon className="w-5 h-5 mr-3" />
                                                {item.name}
                                            </Link>
                                        );
                                    });
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* Click outside to close menus */}
            {(mobileMenuOpen || userMenuOpen || openDropdown) && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => {
                        setMobileMenuOpen(false);
                        setUserMenuOpen(false);
                        setOpenDropdown(null);
                    }}
                />
            )}

            {/* Main Content */}
            <main className="flex-1 p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;