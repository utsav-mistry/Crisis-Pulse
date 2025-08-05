import React from 'react';
import { User, Settings, Shield, Award } from 'lucide-react';

const Profile = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Profile</h1>
                    <p className="text-neutral-600">Manage your account and preferences</p>
                </div>
                <button className="btn btn-outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile
                </button>
            </div>

            <div className="card">
                <div className="card-body text-center py-12">
                    <User className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-neutral-900 mb-2">Profile Page</h3>
                    <p className="text-neutral-600">This page will show your profile information and settings.</p>
                </div>
            </div>
        </div>
    );
};

export default Profile; 