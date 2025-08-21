import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { Link } from 'react-router-dom';

const NotificationBell = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useSocket();
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={handleToggle} className="relative p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                <Bell className="h-6 w-6 text-gray-600" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-20">
                    <div className="py-2 px-4 flex justify-between items-center border-b">
                        <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                        <button onClick={() => markAllAsRead()} className="text-sm text-primary-500 hover:underline">Mark all as read</button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map(notification => {
                                const content = (
                                    <div className={`p-4 border-b ${!notification.link ? '' : 'hover:bg-gray-100'} ${!notification.read ? 'bg-blue-50' : ''}`}>
                                        <p className="text-sm text-gray-700">{notification.message}</p>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-xs text-gray-500">{new Date(notification.createdAt).toLocaleString()}</span>
                                            {!notification.read && (
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Prevent link navigation
                                                        markAsRead(notification._id);
                                                    }}
                                                    className="p-1 rounded-full hover:bg-gray-200 z-10 relative"
                                                >
                                                    <Check className="h-4 w-4 text-green-500" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );

                                if (notification.link) {
                                    return (
                                        <Link to={notification.link} key={notification._id} onClick={() => setIsOpen(false)}>
                                            {content}
                                        </Link>
                                    );
                                }

                                return <div key={notification._id}>{content}</div>;
                            })
                        ) : (
                            <p className="p-4 text-sm text-gray-500">No new notifications.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
