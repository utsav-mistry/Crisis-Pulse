import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Disasters from './pages/Disasters';
import Predictions from './pages/Predictions';
import Contributions from './pages/Contributions';
import Profile from './pages/Profile';
import Alerts from './pages/Alerts';
import TestDisaster from './pages/Admin/TestDisaster';
import AdminDashboard from './pages/Admin/AdminDashboard';
import CrpfNotifications from './pages/Admin/CrpfNotifications';
import VolunteerHelpVerification from './pages/Admin/VolunteerHelpVerification';
import VolunteerDashboard from './pages/Volunteer/VolunteerDashboard';
import LogHelp from './pages/Volunteer/LogHelp';
import SignUpForHelp from './pages/Volunteer/SignUpForHelp';
import HelpLogDetail from './pages/Volunteer/HelpLogDetail';
import NotificationSubscribe from './components/NotificationSubscribe';
import './index.css';

function App() {
    return (
        <AuthProvider>
            <SocketProvider>
                <Router>
                    <div className="min-h-screen bg-neutral-50">
                        <Routes>
                            {/* Auth Routes */}
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />

                            {/* Protected Routes */}
                            <Route path="/" element={<Layout />}>
                                <Route index element={<Dashboard />} />
                                <Route path="disasters" element={<Disasters />} />
                                <Route path="predictions" element={<Predictions />} />
                                <Route path="contributions" element={<Contributions />} />
                                <Route path="alerts" element={<Alerts />} />
                                <Route path="profile" element={<Profile />} />
                                {/* Admin Routes */}
                                <Route path="admin" element={<AdminDashboard />} />
                                <Route path="admin/test" element={<TestDisaster />} />
                                <Route path="admin/crpf-notifications" element={<CrpfNotifications />} />
                                <Route path="admin/volunteer-verification" element={<VolunteerHelpVerification />} />
                                
                                {/* Volunteer Routes */}
                                <Route path="volunteer" element={<VolunteerDashboard />} />
                                <Route path="volunteer/log-help" element={<LogHelp />} />
                                <Route path="volunteer/sign-up" element={<SignUpForHelp />} />
                                <Route path="volunteer/help-log/:id" element={<HelpLogDetail />} />
                            </Route>
                        </Routes>

                        {/* Toast Notifications */}
                        <Toaster
                            position="top-right"
                            toastOptions={{
                                duration: 4000,
                                style: {
                                    background: '#fff',
                                    color: '#374151',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '4px',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                },
                                success: {
                                    iconTheme: {
                                        primary: '#22c55e',
                                        secondary: '#fff',
                                    },
                                },
                                error: {
                                    iconTheme: {
                                        primary: '#ef4444',
                                        secondary: '#fff',
                                    },
                                },
                            }}
                        />
                        
                        {/* Notification Subscribe Button for Non-Logged In Users */}
                        <NotificationSubscribe />
                    </div>
                </Router>
            </SocketProvider>
        </AuthProvider>
    );
}

export default App;