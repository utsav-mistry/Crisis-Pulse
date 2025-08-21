import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FileText, Server, ChevronsLeft, ChevronsRight } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminTestLogs = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        total: 0
    });

    useEffect(() => {
        if (user && user.role !== 'admin') {
            navigate('/dashboard');
            toast.error('Unauthorized access');
        }
    }, [user, navigate]);

    const fetchLogs = async (page = 1) => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/test-logs?page=${page}&limit=10`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setLogs(response.data.logs);
            setPagination({
                currentPage: response.data.currentPage,
                totalPages: response.data.totalPages,
                total: response.data.total
            });
        } catch (error) {
            toast.error('Failed to fetch test logs.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    if (!user || user.role !== 'admin') return null;

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl shadow-lg text-white p-6">
                <div className="flex items-center">
                    <FileText className="w-8 h-8 mr-3" />
                    <div>
                        <h1 className="text-3xl font-bold">Admin Test Logs</h1>
                        <p className="text-gray-300 mt-1">A record of all actions performed in test mode.</p>
                    </div>
                </div>
            </div>

            {loading ? (
                <p>Loading logs...</p>
            ) : (
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead>
                                <tr>
                                    <th>Admin</th>
                                    <th>Action</th>
                                    <th>Timestamp</th>
                                    <th>Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map(log => (
                                    <tr key={log._id}>
                                        <td>{log.admin?.name || 'N/A'}</td>
                                        <td>{log.action}</td>
                                        <td>{new Date(log.timestamp).toLocaleString()}</td>
                                        <td>
                                            <pre className="bg-gray-100 p-2 rounded text-xs">{JSON.stringify(log.details, null, 2)}</pre>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="btn-group mt-4">
                        <button onClick={() => fetchLogs(pagination.currentPage - 1)} disabled={pagination.currentPage <= 1} className="btn"><ChevronsLeft /></button>
                        <button className="btn">Page {pagination.currentPage}</button>
                        <button onClick={() => fetchLogs(pagination.currentPage + 1)} disabled={pagination.currentPage >= pagination.totalPages} className="btn"><ChevronsRight /></button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminTestLogs;
