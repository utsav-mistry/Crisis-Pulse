import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Bell, BrainCircuit, TestTube } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const AdminTestPanel = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [disasterData, setDisasterData] = useState({
        type: 'flood',
        severity: 'medium',
        title: '',
        description: '',
        location: { city: '', state: '', address: '' }
    });
    const [notificationData, setNotificationData] = useState({
        type: 'general',
        severity: 'medium',
        message: '',
        location: { name: 'Site-wide' }
    });
    const [aiAdviceData, setAiAdviceData] = useState({ message: '' });

    const [loading, setLoading] = useState({
        disaster: false,
        notification: false,
        aiAdvice: false
    });

    React.useEffect(() => {
        if (user && user.role !== 'admin') {
            navigate('/dashboard');
            toast.error('Unauthorized access');
        }
    }, [user, navigate]);

    const getToken = () => localStorage.getItem('token');

    const handleCreateTestDisaster = async (e) => {
        e.preventDefault();
        if (!disasterData.title || !disasterData.location.city) {
            return toast.error('Please fill in disaster title and city.');
        }
        setLoading(prev => ({ ...prev, disaster: true }));
        try {
            const payload = { ...disasterData, test: true };
            await axios.post('/api/disasters', payload, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });
            toast.success('Test disaster created successfully. [TEST] notifications sent.');
            setDisasterData({ type: 'flood', severity: 'medium', title: '', description: '', location: { city: '', state: '', address: '' } });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create test disaster.');
        } finally {
            setLoading(prev => ({ ...prev, disaster: false }));
        }
    };

    const handleBroadcastTestNotification = async (e) => {
        e.preventDefault();
        if (!notificationData.message) {
            return toast.error('Please enter a notification message.');
        }
        setLoading(prev => ({ ...prev, notification: true }));
        try {
            const payload = { ...notificationData, test: true };
            await axios.post('/api/notifications/broadcast', payload, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });
            toast.success('Test notification broadcasted successfully.');
            setNotificationData({ type: 'general', severity: 'medium', message: '', location: { name: 'Site-wide' } });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to broadcast test notification.');
        } finally {
            setLoading(prev => ({ ...prev, notification: false }));
        }
    };

    const handleSendTestAiAdvice = async (e) => {
        e.preventDefault();
        if (!aiAdviceData.message) {
            return toast.error('Please enter AI advice.');
        }
        setLoading(prev => ({ ...prev, aiAdvice: true }));
        try {
            const payload = { ...aiAdviceData, test: true };
            await axios.post('/api/admin/ai/advice', payload, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });
            toast.success('Test AI advice sent successfully.');
            setAiAdviceData({ message: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send test AI advice.');
        } finally {
            setLoading(prev => ({ ...prev, aiAdvice: false }));
        }
    };

    if (!user || user.role !== 'admin') return null;

    return (
        <div className="space-y-8">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl shadow-lg text-white p-6">
                <div className="flex items-center">
                    <TestTube className="w-8 h-8 mr-3" />
                    <div>
                        <h1 className="text-3xl font-bold">Admin Test Panel</h1>
                        <p className="text-purple-100 mt-1">Simulate critical system actions with a test flag.</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
                <h2 className="text-xl font-semibold text-neutral-900 mb-4 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                    Simulate Disaster Creation
                </h2>
                <form onSubmit={handleCreateTestDisaster} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Title" value={disasterData.title} onChange={e => setDisasterData({...disasterData, title: e.target.value})} className="input input-bordered w-full" required />
                        <input type="text" placeholder="City" value={disasterData.location.city} onChange={e => setDisasterData({...disasterData, location: {...disasterData.location, city: e.target.value}})} className="input input-bordered w-full" required />
                    </div>
                    <textarea placeholder="Description" value={disasterData.description} onChange={e => setDisasterData({...disasterData, description: e.target.value})} className="textarea textarea-bordered w-full" />
                    <button type="submit" disabled={loading.disaster} className="btn btn-primary">
                        {loading.disaster ? 'Simulating...' : 'Create Test Disaster'}
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
                <h2 className="text-xl font-semibold text-neutral-900 mb-4 flex items-center">
                    <Bell className="w-5 h-5 mr-2 text-blue-500" />
                    Simulate Notification Broadcast
                </h2>
                <form onSubmit={handleBroadcastTestNotification} className="space-y-4">
                    <textarea placeholder="Notification Message" value={notificationData.message} onChange={e => setNotificationData({...notificationData, message: e.target.value})} className="textarea textarea-bordered w-full" required />
                    <button type="submit" disabled={loading.notification} className="btn btn-info">
                        {loading.notification ? 'Broadcasting...' : 'Broadcast Test Notification'}
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
                <h2 className="text-xl font-semibold text-neutral-900 mb-4 flex items-center">
                    <BrainCircuit className="w-5 h-5 mr-2 text-green-500" />
                    Simulate AI Safety Advice
                </h2>
                <form onSubmit={handleSendTestAiAdvice} className="space-y-4">
                    <textarea placeholder="AI Safety Advice" value={aiAdviceData.message} onChange={e => setAiAdviceData({...aiAdviceData, message: e.target.value})} className="textarea textarea-bordered w-full" required />
                    <button type="submit" disabled={loading.aiAdvice} className="btn btn-success">
                        {loading.aiAdvice ? 'Sending...' : 'Send Test AI Advice'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminTestPanel;
