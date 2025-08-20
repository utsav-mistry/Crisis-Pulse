import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, AlertTriangle, Users, Heart, Trophy, Activity, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
    const { user } = useAuth();
    const features = [
        {
            icon: AlertTriangle,
            title: 'Real-time Disaster Alerts',
            description: 'Get instant notifications about disasters and emergencies in your area with AI-powered predictions.'
        },
        {
            icon: Users,
            title: 'Community Response',
            description: 'Connect with volunteers and contribute resources to help disaster victims in your community.'
        },
        {
            icon: Shield,
            title: 'CRPF Integration',
            description: 'Automatic CRPF notification system for high-severity disasters ensures rapid emergency response.'
        },
        {
            icon: Heart,
            title: 'Resource Contributions',
            description: 'Donate food, water, medical supplies, and other essentials to support disaster relief efforts.'
        },
        {
            icon: Trophy,
            title: 'Points & Rewards',
            description: 'Earn points for contributions and volunteer work. Compete on leaderboards and unlock achievements.'
        },
        {
            icon: Activity,
            title: 'Live Disaster Feed',
            description: 'Stay updated with real-time disaster information, severity levels, and response status.'
        }
    ];

    // Remove dummy stats - will be replaced with real data
    const stats = [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50">
            {/* Navigation */}
            <nav className="bg-white shadow-sm border-b border-neutral-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-neutral-900">Crisis Pulse</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            {user ? (
                                <Link to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} className="btn btn-primary">
                                    Go to Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link to="/login" className="text-neutral-600 hover:text-neutral-900 font-medium">
                                        Sign In
                                    </Link>
                                    <Link to="/register" className="btn btn-primary">
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="mb-8">
                        <div className="inline-flex items-center px-4 py-2 bg-primary-100 text-primary-800 rounded-full text-sm font-medium mb-6">
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Real-time Disaster Management System
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 mb-6">
                            Stay Safe, Stay
                            <span className="text-primary-600"> Connected</span>
                        </h1>
                        <p className="text-xl text-neutral-600 mb-8 max-w-3xl mx-auto">
                            Crisis Pulse is India's premier disaster management platform that connects communities,
                            volunteers, and emergency responders to save lives and minimize disaster impact.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            {user ? (
                                <Link to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} className="btn btn-primary btn-lg">
                                    Go to Dashboard
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Link>
                            ) : (
                                <>
                                    <Link to="/register" className="btn btn-primary btn-lg">
                                        Join the Community
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </Link>
                                    <Link to="/disaster-feed" className="btn btn-outline btn-lg">
                                        View Live Feed
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                                    {stat.value}
                                </div>
                                <div className="text-neutral-600 font-medium">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                            Comprehensive Disaster Management
                        </h2>
                        <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
                            Our platform provides end-to-end disaster management solutions for individuals,
                            communities, and emergency responders.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <div key={index} className="card hover:shadow-lg transition-shadow duration-300">
                                    <div className="card-body p-6">
                                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                                            <Icon className="w-6 h-6 text-primary-600" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                                            {feature.title}
                                        </h3>
                                        <p className="text-neutral-600">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 bg-neutral-50 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                            How Crisis Pulse Works
                        </h2>
                        <p className="text-xl text-neutral-600">
                            Simple steps to stay protected and help your community
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-white font-bold text-xl">1</span>
                            </div>
                            <h3 className="text-xl font-semibold text-neutral-900 mb-3">Sign Up & Set Location</h3>
                            <p className="text-neutral-600">
                                Create your account and set your location to receive relevant disaster alerts and opportunities to help.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-white font-bold text-xl">2</span>
                            </div>
                            <h3 className="text-xl font-semibold text-neutral-900 mb-3">Get Alerts & Contribute</h3>
                            <p className="text-neutral-600">
                                Receive real-time disaster alerts and contribute resources or volunteer time to help affected communities.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-white font-bold text-xl">3</span>
                            </div>
                            <h3 className="text-xl font-semibold text-neutral-900 mb-3">Earn Points & Save Lives</h3>
                            <p className="text-neutral-600">
                                Earn points for your contributions, climb leaderboards, and make a real difference in disaster response.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-primary-600 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Ready to Make a Difference?
                    </h2>
                    <p className="text-xl text-primary-100 mb-8">
                        Join thousands of volunteers and contributors who are helping build a more resilient India.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register" className="btn bg-white text-primary-600 hover:bg-neutral-100 btn-lg">
                            Start Helping Today
                        </Link>
                        <Link to="/login" className="btn btn-outline border-white text-white hover:bg-white hover:text-primary-600 btn-lg">
                            Sign In
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-neutral-900 text-white py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xl font-bold">Crisis Pulse</span>
                            </div>
                            <p className="text-neutral-400 mb-4 max-w-md">
                                India's premier disaster management platform connecting communities,
                                volunteers, and emergency responders to save lives.
                            </p>
                            <div className="flex items-center space-x-2 text-sm text-neutral-400">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span>Trusted by 10,000+ users nationwide</span>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Platform</h4>
                            <ul className="space-y-2 text-neutral-400">
                                <li><Link to="/disaster-feed" className="hover:text-white">Live Disaster Feed</Link></li>
                                <li><Link to="/leaderboard" className="hover:text-white">Leaderboard</Link></li>
                                <li><Link to="/safety-center" className="hover:text-white">Safety Center</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Get Started</h4>
                            <ul className="space-y-2 text-neutral-400">
                                <li><Link to="/register" className="hover:text-white">Sign Up</Link></li>
                                <li><Link to="/login" className="hover:text-white">Sign In</Link></li>
                                <li><Link to="/volunteer/sign-up" className="hover:text-white">Become Volunteer</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-neutral-800 mt-8 pt-8 text-center text-neutral-400">
                        <p>&copy; 2025 Crisis Pulse. Built for India's safety and resilience.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
