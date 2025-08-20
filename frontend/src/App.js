import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Components
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import GlobalAlert from './components/GlobalAlert';
import NotificationSubscribe from './components/NotificationSubscribe';

// Auth Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// Setup Pages
import AdminSetup from './pages/Setup/AdminSetup';

// Main Pages
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import DisasterFeed from './pages/DisasterFeed';
import SafetyCenter from './pages/SafetyCenter';
import Profile from './pages/Profile';
import Contributions from './pages/Contributions';
import Leaderboard from './pages/Leaderboard';
import Disasters from './pages/Disasters';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminTestPanel from './pages/Admin/AdminTestPanel';
import CrpfNotifications from './pages/Admin/CrpfNotifications';
import VolunteerHelpVerification from './pages/Admin/VolunteerHelpVerification';
import UserManagement from './pages/Admin/UserManagement';

// Volunteer Pages
import LogHelp from './pages/Volunteer/LogHelp';
import HelpLogDetail from './pages/Volunteer/HelpLogDetail';
import SignUpForHelp from './pages/Volunteer/SignUpForHelp';

// Styles
import './index.css';

function App() {
    return (
        <Router>
            <AuthProvider>
                <SocketProvider>
                    <div className="min-h-screen bg-neutral-50">
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/" element={<Landing />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/setup/admin" element={<AdminSetup />} />

                            {/* Layout Routes - All app routes use the same layout */}
                            <Route path="/*" element={<Layout />}>
                                {/* Protected Routes */}
                                <Route path="dashboard" element={
                                    <ProtectedRoute>
                                        <Dashboard />
                                    </ProtectedRoute>
                                } />
                                <Route path="disaster-feed" element={<DisasterFeed />} />
                                <Route path="safety-center" element={<SafetyCenter />} />
                                <Route path="profile" element={
                                    <ProtectedRoute>
                                        <Profile />
                                    </ProtectedRoute>
                                } />
                                <Route path="contributions" element={
                                    <ProtectedRoute>
                                        <Contributions />
                                    </ProtectedRoute>
                                } />
                                <Route path="leaderboard" element={<Leaderboard />} />
                                <Route path="disasters" element={
                                    <ProtectedRoute requiredRole="admin">
                                        <Disasters />
                                    </ProtectedRoute>
                                } />

                                {/* Admin Routes */}
                                <Route path="admin/dashboard" element={
                                    <ProtectedRoute requiredRole="admin">
                                        <AdminDashboard />
                                    </ProtectedRoute>
                                } />
                                <Route path="admin/test-panel" element={
                                    <ProtectedRoute requiredRole="admin">
                                        <AdminTestPanel />
                                    </ProtectedRoute>
                                } />
                                <Route path="admin/crpf-notifications" element={
                                    <ProtectedRoute requiredRole="admin">
                                        <CrpfNotifications />
                                    </ProtectedRoute>
                                } />
                                <Route path="admin/volunteer-verification" element={
                                    <ProtectedRoute requiredRole="admin">
                                        <VolunteerHelpVerification />
                                    </ProtectedRoute>
                                } />
                                <Route path="admin/users" element={
                                    <ProtectedRoute requiredRole="admin">
                                        <UserManagement />
                                    </ProtectedRoute>
                                } />

                                {/* Volunteer Routes */}
                                <Route path="volunteer/log-help" element={
                                    <ProtectedRoute requiredRole="volunteer">
                                        <LogHelp />
                                    </ProtectedRoute>
                                } />
                                <Route path="volunteer/help-log/:id" element={
                                    <ProtectedRoute requiredRole="volunteer">
                                        <HelpLogDetail />
                                    </ProtectedRoute>
                                } />
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
                        
                        {/* Global Alert Component */}
                        <GlobalAlert />
                        
                        {/* Notification Subscribe Button for Non-Logged In Users */}
                        <NotificationSubscribe />
                    </div>
                </SocketProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;