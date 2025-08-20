import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import { 
    Plus, 
    Send, 
    Bell, 
    Zap, 
    MessageCircle, 
    AlertTriangle, 
    TestTube, 
    Shield, 
    Settings 
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const AdminTestPanel = () => {
    const { user } = useAuth();
    const { socket } = useSocket();
    const navigate = useNavigate();

    // Test disaster form
    const [testDisaster, setTestDisaster] = useState({
        type: 'flood',
        severity: 'medium',
        title: '',
        description: '',
        location: {
            city: '',
            state: '',
            address: ''
        }
    });

    // Notification forms
    const [generalNotification, setGeneralNotification] = useState('');
    const [emergencyAlert, setEmergencyAlert] = useState('');
    const [severityNotification, setSeverityNotification] = useState({
        message: '',
        severity: 'info',
        title: ''
    });
    const [crpfNotification, setCrpfNotification] = useState({
        title: '',
        message: '',
        priority: 'medium'
    });

    // Loading states
    const [loading, setLoading] = useState({
        disaster: false,
        general: false,
        emergency: false,
        severity: false,
        crpf: false
    });

    // Redirect if not admin
    React.useEffect(() => {
        if (user && user.role !== 'admin') {
            navigate('/dashboard');
            toast.error('Unauthorized access');
        }
    }, [user, navigate]);

    const handleCreateTestDisaster = async () => {
        if (!testDisaster.title || !testDisaster.location.city) {
            toast.error('Please fill in required fields (title and city)');
            return;
        }

        setLoading(prev => ({ ...prev, disaster: true }));
        try {
            const disasterData = {
                ...testDisaster,
                reportedBy: user._id,
                status: 'active'
            };

            const response = await axios.post('/api/disasters/raise', disasterData, {
                headers: { 
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 201) {
                toast.success(`Test ${testDisaster.severity} disaster created successfully`);
                
                // Send real-time notification via socket
                if (socket) {
                    socket.emit('disaster-alert', {
                        type: testDisaster.type,
                        severity: testDisaster.severity,
                        location: `${testDisaster.location.city}, ${testDisaster.location.state}`,
                        message: `New ${testDisaster.severity} ${testDisaster.type} disaster reported in ${testDisaster.location.city}`,
                        adminTest: true
                    });
                }

                // Reset form
                setTestDisaster({
                    type: 'flood',
                    severity: 'medium',
                    title: '',
                    description: '',
                    location: { city: '', state: '', address: '' }
                });
            }
        } catch (error) {
            console.error('Error creating test disaster:', error);
            toast.error(error.response?.data?.message || 'Failed to create test disaster');
        } finally {
            setLoading(prev => ({ ...prev, disaster: false }));
        }
    };

    const handleSendGeneralNotification = () => {
        if (!generalNotification.trim()) {
            toast.error('Please enter a notification message');
            return;
        }

        if (socket) {
            setLoading(prev => ({ ...prev, general: true }));
            socket.emit('admin-broadcast', {
                type: 'general',
                message: generalNotification,
                adminName: user.name,
                timestamp: new Date()
            });
            toast.success('General notification sent to all users');
            setGeneralNotification('');
            setTimeout(() => setLoading(prev => ({ ...prev, general: false })), 1000);
        } else {
            toast.error('Socket connection not available');
        }
    };

    const handleSendEmergencyAlert = () => {
        if (!emergencyAlert.trim()) {
            toast.error('Please enter an emergency alert message');
            return;
        }

        if (socket) {
            setLoading(prev => ({ ...prev, emergency: true }));
            socket.emit('emergency-broadcast', {
                type: 'emergency',
                message: emergencyAlert,
                severity: 'extreme',
                adminName: user.name,
                timestamp: new Date()
            });
            toast.success('Emergency alert sent to all users');
            setEmergencyAlert('');
            setTimeout(() => setLoading(prev => ({ ...prev, emergency: false })), 1000);
        } else {
            toast.error('Socket connection not available');
        }
    };

    const handleSendSeverityNotification = () => {
        if (!severityNotification.message.trim()) {
            toast.error('Please enter a notification message');
            return;
        }

        if (socket) {
            setLoading(prev => ({ ...prev, severity: true }));
            socket.emit('severity-notification', {
                type: 'severity',
                title: severityNotification.title || `${severityNotification.severity.toUpperCase()} Notification`,
                message: severityNotification.message,
                severity: severityNotification.severity,
                adminName: user.name,
                timestamp: new Date()
            });
            
            const severityLabels = {
                info: 'Informational',
                positive: 'Positive Update', 
                low: 'Low Level Disaster',
                high: 'High Level Disaster',
                extreme: 'Extreme Disaster'
            };
            
            toast.success(`${severityLabels[severityNotification.severity]} notification sent to all users`);
            setSeverityNotification({ message: '', severity: 'info', title: '' });
            setTimeout(() => setLoading(prev => ({ ...prev, severity: false })), 1000);
        } else {
            toast.error('Socket connection not available');
        }
    };

    const handleSendCRPFNotification = async () => {
        if (!crpfNotification.title || !crpfNotification.message) {
            toast.error('Please fill in CRPF notification title and message');
            return;
        }

        setLoading(prev => ({ ...prev, crpf: true }));
        try {
            // Create a manual CRPF notification
            const response = await axios.post('/api/crpf-notifications/manual', crpfNotification, {
                headers: { 
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 201) {
                toast.success('CRPF notification created successfully');
                
                // Send via socket as well
                if (socket) {
                    socket.emit('crpf-notification', {
                        ...crpfNotification,
                        adminName: user.name,
                        timestamp: new Date()
                    });
                }

                setCrpfNotification({ title: '', message: '', priority: 'medium' });
            }
        } catch (error) {
            console.error('Error sending CRPF notification:', error);
            toast.error(error.response?.data?.message || 'Failed to send CRPF notification');
        } finally {
            setLoading(prev => ({ ...prev, crpf: false }));
        }
    };

    if (!user || user.role !== 'admin') {
        return null;
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl shadow-lg text-white p-6">
                <div className="flex items-center">
                    <TestTube className="w-8 h-8 mr-3" />
                    <div>
                        <h1 className="text-3xl font-bold">Admin Test Panel</h1>
                        <p className="text-purple-100 mt-1">
                            Test disaster creation, notifications, and system features
                        </p>
                    </div>
                </div>
            </div>

            {/* Test Disaster Creation */}
            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
                <h2 className="text-xl font-semibold text-neutral-900 mb-4 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                    Create Test Disaster
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Disaster Type
                        </label>
                        <select
                            value={testDisaster.type}
                            onChange={(e) => setTestDisaster({...testDisaster, type: e.target.value})}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="flood">Flood</option>
                            <option value="earthquake">Earthquake</option>
                            <option value="fire">Fire</option>
                            <option value="storm">Storm</option>
                            <option value="cyclone">Cyclone</option>
                            <option value="landslide">Landslide</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Severity Level
                        </label>
                        <select
                            value={testDisaster.severity}
                            onChange={(e) => setTestDisaster({...testDisaster, severity: e.target.value})}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="extreme">Extreme</option>
                        </select>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Title *
                    </label>
                    <input
                        type="text"
                        value={testDisaster.title}
                        onChange={(e) => setTestDisaster({...testDisaster, title: e.target.value})}
                        placeholder="e.g., Heavy Flooding in Downtown Area"
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                            City *
                        </label>
                        <input
                            type="text"
                            value={testDisaster.location.city}
                            onChange={(e) => setTestDisaster({
                                ...testDisaster, 
                                location: {...testDisaster.location, city: e.target.value}
                            })}
                            placeholder="Mumbai"
                            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                            State
                        </label>
                        <input
                            type="text"
                            value={testDisaster.location.state}
                            onChange={(e) => setTestDisaster({
                                ...testDisaster, 
                                location: {...testDisaster.location, state: e.target.value}
                            })}
                            placeholder="Maharashtra"
                            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Description
                    </label>
                    <textarea
                        value={testDisaster.description}
                        onChange={(e) => setTestDisaster({...testDisaster, description: e.target.value})}
                        placeholder="Detailed description of the test disaster scenario..."
                        rows="3"
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>

                <button
                    onClick={handleCreateTestDisaster}
                    disabled={loading.disaster}
                    className="btn btn-primary flex items-center"
                >
                    {loading.disaster ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                        <Plus className="w-4 h-4 mr-2" />
                    )}
                    Create Test Disaster
                </button>
            </div>

            {/* Notification Testing */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* General Notifications */}
                <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
                        <MessageCircle className="w-5 h-5 mr-2 text-blue-500" />
                        General Notification
                    </h3>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Message
                        </label>
                        <textarea
                            value={generalNotification}
                            onChange={(e) => setGeneralNotification(e.target.value)}
                            placeholder="Enter general notification message for all users..."
                            rows="3"
                            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    
                    <button
                        onClick={handleSendGeneralNotification}
                        disabled={loading.general}
                        className="btn bg-blue-600 text-white hover:bg-blue-700 flex items-center w-full justify-center"
                    >
                        {loading.general ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                            <Send className="w-4 h-4 mr-2" />
                        )}
                        Send to All Users
                    </button>
                </div>

                {/* Disaster Severity Notifications */}
                <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
                        Disaster Severity Notifications
                    </h3>
                    
                    <div className="mb-3">
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Title (Optional)
                        </label>
                        <input
                            type="text"
                            value={severityNotification.title}
                            onChange={(e) => setSeverityNotification({...severityNotification, title: e.target.value})}
                            placeholder="Custom notification title..."
                            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    <div className="mb-3">
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Severity Level
                        </label>
                        <select
                            value={severityNotification.severity}
                            onChange={(e) => setSeverityNotification({...severityNotification, severity: e.target.value})}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="info">🔵 Informational (Blue)</option>
                            <option value="positive">🟢 Positive Updates (Green)</option>
                            <option value="low">🟡 Low Level Disaster (Yellow)</option>
                            <option value="high">🔴 High Level Disaster (Red)</option>
                            <option value="extreme">⚫ Extreme Disaster (Black)</option>
                        </select>
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Message
                        </label>
                        <textarea
                            value={severityNotification.message}
                            onChange={(e) => setSeverityNotification({...severityNotification, message: e.target.value})}
                            placeholder="Enter severity-based notification message..."
                            rows="2"
                            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    
                    <button
                        onClick={handleSendSeverityNotification}
                        disabled={loading.severity}
                        className={`btn flex items-center w-full justify-center text-white ${
                            severityNotification.severity === 'info' ? 'bg-blue-600 hover:bg-blue-700' :
                            severityNotification.severity === 'positive' ? 'bg-green-600 hover:bg-green-700' :
                            severityNotification.severity === 'low' ? 'bg-yellow-600 hover:bg-yellow-700' :
                            severityNotification.severity === 'high' ? 'bg-red-600 hover:bg-red-700' :
                            'bg-gray-800 hover:bg-gray-900'
                        }`}
                    >
                        {loading.severity ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                            <Bell className="w-4 h-4 mr-2" />
                        )}
                        Send {severityNotification.severity.charAt(0).toUpperCase() + severityNotification.severity.slice(1)}
                    </button>
                </div>

                {/* Emergency Alerts */}
                <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
                        <Zap className="w-5 h-5 mr-2 text-red-500" />
                        Emergency Alert
                    </h3>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Emergency Message
                        </label>
                        <textarea
                            value={emergencyAlert}
                            onChange={(e) => setEmergencyAlert(e.target.value)}
                            placeholder="Enter emergency alert message (extreme priority)..."
                            rows="3"
                            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>
                    
                    <button
                        onClick={handleSendEmergencyAlert}
                        disabled={loading.emergency}
                        className="btn bg-red-600 text-white hover:bg-red-700 flex items-center w-full justify-center"
                    >
                        {loading.emergency ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                            <Bell className="w-4 h-4 mr-2" />
                        )}
                        Send Emergency Alert
                    </button>
                </div>
            </div>

            {/* CRPF Manual Notification */}
            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-green-500" />
                    Manual CRPF Notification
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Title
                        </label>
                        <input
                            type="text"
                            value={crpfNotification.title}
                            onChange={(e) => setCrpfNotification({...crpfNotification, title: e.target.value})}
                            placeholder="CRPF Notification Title"
                            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Priority
                        </label>
                        <select
                            value={crpfNotification.priority}
                            onChange={(e) => setCrpfNotification({...crpfNotification, priority: e.target.value})}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Message
                    </label>
                    <textarea
                        value={crpfNotification.message}
                        onChange={(e) => setCrpfNotification({...crpfNotification, message: e.target.value})}
                        placeholder="Enter CRPF notification message..."
                        rows="3"
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>
                
                <button
                    onClick={handleSendCRPFNotification}
                    disabled={loading.crpf}
                    className="btn bg-green-600 text-white hover:bg-green-700 flex items-center"
                >
                    {loading.crpf ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                        <Shield className="w-4 h-4 mr-2" />
                    )}
                    Send CRPF Notification
                </button>
            </div>

            {/* Info Panel */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start">
                    <Settings className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                    <div>
                        <h4 className="font-medium text-blue-900">Test Panel Information</h4>
                        <p className="text-sm text-blue-700 mt-1">
                            This panel allows you to test all system features including disaster creation, 
                            real-time notifications, and CRPF alerts. All notifications are sent via WebSocket 
                            to connected users and stored in the database for offline users.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminTestPanel;
