import React from 'react';
import NotificationList from './NotificationList';
import useNotifications from '../../hooks/useNotifications';
import { FiX, FiCheck, FiTrash2 } from 'react-icons/fi';



const NotificationDrawer = ({ onClose }) => {
    const {
        notifications,
        unreadCount,
        loading,
        actions
    } = useNotifications();

    return (
        <div className="animate-slide-in-right overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-zinc-800">
                <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">
                        Notifications
                    </h3>
                    {unreadCount > 0 && (
                        <p className="text-xs text-gray-500 dark:text-zinc-400">
                            {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-1">
                    {unreadCount > 0 && (
                        <button
                            onClick={actions.handleMarkAllRead}
                            className="rounded-lg p-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                            title="Mark all as read"
                        >
                            <FiCheck className="h-4 w-4" />
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                    >
                        <FiX className="h-4 w-4" /> 
                    </button>
                </div>
            </div>

            {/* Body */}
            <NotificationList
                notifications={notifications.slice(0, 10)} // Limit drawer to 10 latest
                loading={loading}
                onMarkRead={actions.handleMarkRead}
                onDelete={actions.handleDelete}
            />

            {/* Footer */}
            <div className="border-t border-gray-100 bg-gray-50 px-4 py-2.5 text-center dark:border-zinc-800 dark:bg-zinc-800/50">
                <button
                    onClick={() => window.location.href = '/notifications'}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                    View all notifications →
                </button>
            </div>
        </div>
    );
};

export default NotificationDrawer;
