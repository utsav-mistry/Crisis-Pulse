import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, UserPlus } from 'lucide-react';

const Register = () => {
    return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="flex justify-center">
                        <div className="w-16 h-16 bg-emergency-600 rounded-sharp-lg flex items-center justify-center shadow-sharp-lg">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h2 className="mt-6 text-3xl font-bold text-neutral-900">
                        Crisis Pulse
                    </h2>
                    <p className="mt-2 text-sm text-neutral-600">
                        Disaster Response Platform
                    </p>
                    <p className="mt-6 text-lg font-medium text-neutral-900">
                        Create your account
                    </p>
                </div>

                <div className="card">
                    <div className="card-body text-center py-12">
                        <UserPlus className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-neutral-900 mb-2">Registration</h3>
                        <p className="text-neutral-600 mb-6">Registration form will be implemented here.</p>
                        <Link to="/login" className="btn btn-primary">
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register; 