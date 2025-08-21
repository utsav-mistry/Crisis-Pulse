import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SubscriptionsPage = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSubscriptions = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                };
                const response = await axios.get('/api/subscriptions', config);
                setSubscriptions(response.data);
            } catch (err) {
                setError('Failed to fetch subscriptions.');
            }
            setLoading(false);
        };

        fetchSubscriptions();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Subscribed Users</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b">User</th>
                            <th className="py-2 px-4 border-b">Socket ID</th>
                            <th className="py-2 px-4 border-b">Location</th>
                            <th className="py-2 px-4 border-b">Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subscriptions.map(sub => (
                            <tr key={sub._id}>
                                <td className="py-2 px-4 border-b">{sub.userId ? sub.userId.name : 'Guest'}</td>
                                <td className="py-2 px-4 border-b">{sub.socketId}</td>
                                <td className="py-2 px-4 border-b">{sub.location.coordinates.join(', ')}</td>
                                <td className="py-2 px-4 border-b">{sub.isGuest ? 'Guest' : 'Registered'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SubscriptionsPage;
