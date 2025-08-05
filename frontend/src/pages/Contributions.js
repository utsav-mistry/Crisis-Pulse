import React from 'react';
import { Heart, Gift, Award } from 'lucide-react';

const Contributions = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Contributions</h1>
                    <p className="text-neutral-600">Track your contributions and earn points</p>
                </div>
                <button className="btn btn-safety">
                    <Heart className="w-4 h-4 mr-2" />
                    Make Contribution
                </button>
            </div>

            <div className="card">
                <div className="card-body text-center py-12">
                    <Heart className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-neutral-900 mb-2">Contributions Page</h3>
                    <p className="text-neutral-600">This page will show your contributions and points earned.</p>
                </div>
            </div>
        </div>
    );
};

export default Contributions; 