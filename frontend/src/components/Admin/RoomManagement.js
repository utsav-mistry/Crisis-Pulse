import React, { useState, useEffect } from 'react';
import { Users, Activity, MapPin, RefreshCw, Eye } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';

const RoomManagement = () => {
    const [rooms, setRooms] = useState([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [loading, setLoading] = useState(false);
    const { socket, isConnected } = useSocket();

    useEffect(() => {
        if (socket && isConnected) {
            // Listen for room data updates
            socket.on('room_data_update', (data) => {
                console.log('Received room data:', data);
                if (data.error) {
                    toast.error(`Room data error: ${data.error}`);
                    return;
                }
                setRooms(data.rooms || []);
                setTotalUsers(data.totalUsers || 0);
                setLoading(false);
            });

            // Listen for room data changes and auto-refresh
            socket.on('room_data_changed', () => {
                fetchRoomData();
            });

            // Request initial room data
            fetchRoomData();

            return () => {
                socket.off('room_data_update');
                socket.off('room_data_changed');
            };
        }
    }, [socket, isConnected]);

    const fetchRoomData = () => {
        if (socket && isConnected) {
            setLoading(true);
            console.log('Requesting room data from socket...');
            socket.emit('admin_get_room_data');
            setTimeout(() => {
                setLoading(false);
                console.log('Room data request timeout');
            }, 3000);
        } else {
            console.log('Socket not connected:', { socket: !!socket, isConnected });
            toast.error('Socket connection not available');
        }
    };

    useEffect(() => {
        fetchRoomData();
    }, []);

    const handleRefresh = () => {
        fetchRoomData();
        toast.success('Room data refreshed');
    };

    const formatRoomName = (roomName) => {
        if (!roomName) return 'Global Room';
        if (roomName.includes(',')) {
            const [city, state] = roomName.split(',');
            return `${city.trim()}, ${state.trim()}`;
        }
        return roomName;
    };

    const getRoomIcon = (roomName) => {
        if (!roomName || roomName === 'global') return <Activity className="w-5 h-5 text-blue-500" />;
        return <MapPin className="w-5 h-5 text-green-500" />;
    };

    return (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm">
            <div className="flex items-center justify-between p-6 border-b border-neutral-100">
                <div>
                    <h3 className="text-lg font-semibold text-neutral-900 flex items-center">
                        <Users className="w-5 h-5 mr-2 text-blue-500" />
                        Room Management
                    </h3>
                    <p className="text-sm text-neutral-600 mt-1">
                        Monitor users in different location-based rooms
                    </p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={loading}
                    className="btn btn-outline btn-sm flex items-center"
                >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            <div className="p-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-900">Total Users Online</p>
                                <p className="text-2xl font-bold text-blue-600">{totalUsers}</p>
                            </div>
                            <Users className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-900">Active Rooms</p>
                                <p className="text-2xl font-bold text-green-600">{rooms.length}</p>
                            </div>
                            <MapPin className="w-8 h-8 text-green-500" />
                        </div>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-purple-900">Avg Users/Room</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {rooms.length > 0 ? Math.round(totalUsers / rooms.length) : 0}
                                </p>
                            </div>
                            <Activity className="w-8 h-8 text-purple-500" />
                        </div>
                    </div>
                </div>

                {/* Room List */}
                <div className="space-y-3">
                    <h4 className="text-md font-semibold text-neutral-900 flex items-center">
                        <Eye className="w-4 h-4 mr-2" />
                        Active Rooms ({rooms.length})
                    </h4>
                    
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                            <p className="text-neutral-600">Loading room data...</p>
                        </div>
                    ) : rooms.length === 0 ? (
                        <div className="text-center py-8">
                            <Users className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                            <p className="text-neutral-600">No active rooms found</p>
                            <p className="text-sm text-neutral-500 mt-1">Users will appear here when they join location-based rooms</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {rooms.map((room, index) => (
                                <div key={index} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
                                    <div className="flex items-center space-x-3">
                                        {getRoomIcon(room.name)}
                                        <div>
                                            <h5 className="font-medium text-neutral-900">
                                                {formatRoomName(room.name)}
                                            </h5>
                                            <p className="text-sm text-neutral-600">
                                                {room.userCount} {room.userCount === 1 ? 'user' : 'users'} connected
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                                            {room.userCount}
                                        </span>
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Connection Status */}
                <div className="mt-6 p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                            <span className="text-sm font-medium text-neutral-700">
                                Socket Connection: {isConnected ? 'Connected' : 'Disconnected'}
                            </span>
                        </div>
                        <span className="text-xs text-neutral-500">
                            Last updated: {new Date().toLocaleTimeString()}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoomManagement;
