import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, Shield, Lock } from 'lucide-react';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-neutral-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Check if user has required role
    if (requiredRole && user?.role !== requiredRole) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50">
                <div className="max-w-md w-full mx-auto">
                    <div className="card text-center">
                        <div className="card-body">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Lock className="w-8 h-8 text-red-600" />
                            </div>
                            <h2 className="text-xl font-bold text-neutral-900 mb-2">
                                Access Denied
                            </h2>
                            <p className="text-neutral-600 mb-4">
                                You don't have permission to access this page. 
                                This page requires <span className="font-semibold capitalize">{requiredRole}</span> role.
                            </p>
                            <div className="bg-neutral-50 rounded-lg p-3 mb-4">
                                <p className="text-sm text-neutral-700">
                                    <span className="font-medium">Your current role:</span> 
                                    <span className="capitalize"> {user?.role || 'user'}</span>
                                </p>
                                <p className="text-sm text-neutral-700">
                                    <span className="font-medium">Required role:</span> 
                                    <span className="capitalize"> {requiredRole}</span>
                                </p>
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => window.history.back()}
                                    className="btn btn-outline flex-1"
                                >
                                    Go Back
                                </button>
                                <button
                                    onClick={() => window.location.href = '/'}
                                    className="btn btn-primary flex-1"
                                >
                                    Go Home
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;
