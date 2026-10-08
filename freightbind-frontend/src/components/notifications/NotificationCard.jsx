import React from 'react';
import {
    FiCheck, FiTrash2, FiPackage,
    FiAlertCircle, FiTruck, FiClock, FiAlertOctagon, FiMessageSquare
} from 'react-icons/fi';

// --- Helper Functions ---

const getIcon = (type) => {
    // Matches the exact normalized type strings produced in notificationSlice
    // (n.type.toLowerCase().replace(/\s+/g, '_')).
    switch (type) {
        case 'shipment_created': return <FiPackage className="h-4 w-4 text-blue-500" />;
        case 'shipment_updated': return <FiPackage className="h-4 w-4 text-indigo-500" />;
        case 'shipment_assigned': return <FiTruck className="h-4 w-4 text-purple-500" />;
        case 'shipment_cancelled': return <FiAlertCircle className="h-4 w-4 text-red-500" />;
        case 'shipment_delayed': return <FiAlertCircle className="h-4 w-4 text-amber-500" />;
        case 'shipment_delivered': return <FiCheck className="h-4 w-4 text-emerald-500" />;
        case 'ai_alert': return <FiAlertOctagon className="h-4 w-4 text-rose-500" />;
        case 'chat_message': return <FiMessageSquare className="h-4 w-4 text-harbor-500" />;
        default: return <FiClock className="h-4 w-4 text-gray-500" />;
    }
};

const getPriorityColor = (priority) => {
    switch (priority) {
        case 'high': return 'border-l-red-500 bg-red-50/50 dark:bg-red-900/10';
        case 'medium': return 'border-l-amber-500 bg-amber-50/50 dark:bg-amber-900/10';
        case 'low': return 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/10';
        default: return 'border-l-gray-300 dark:border-l-zinc-700';
    }
};

// Custom relative time formatter (replaces date-fns)
const getRelativeTime = (dateString) => {
    if (!dateString) return 'Just now';

    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

// --- Component ---

const NotificationCard = ({ notification, onMarkRead, onDelete }) => {
    const { id, title, message, type, priority, read, createdAt, shipmentId } = notification;

    // Use custom helper instead of formatDistanceToNow
    const relativeTime = getRelativeTime(createdAt);

    const borderColorClass = read ? '' : getPriorityColor(priority);
    const opacityClass = read ? 'opacity-75' : 'opacity-100';

    return (
        <div
            className={`group relative flex items-start gap-3 border-b border-gray-100 p-4 transition-all hover:bg-gray-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50 ${borderColorClass} ${opacityClass}`}
        >
            {/* Icon Container */}
            <div className="mt-0.5 rounded-full bg-white p-2 shadow-sm ring-1 ring-gray-100 dark:bg-zinc-800 dark:ring-zinc-700">
                {getIcon(type)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm font-medium truncate ${read ? 'text-gray-600 dark:text-zinc-400' : 'text-gray-900 dark:text-zinc-100'}`}>
                        {title}
                    </p>
                    <span className="text-xs text-gray-400 whitespace-nowrap">{relativeTime}</span>
                </div>

                <p className="mt-1 text-xs text-gray-500 line-clamp-2 dark:text-zinc-400">
                    {message}
                </p>

                {shipmentId && (
                    <span className="mt-2 inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-zinc-800 dark:text-zinc-300">
                        SHP-{shipmentId.slice(-6).toUpperCase()}
                    </span>
                )}
            </div>

            {/* Actions (Visible on Hover or Unread) */}
            <div className={`flex flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100 ${!read ? 'opacity-100' : ''}`}>
                {!read && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onMarkRead(id); }}
                        className="rounded p-1 text-gray-400 hover:bg-green-100 hover:text-green-600 dark:hover:bg-green-900/30 dark:hover:text-green-400"
                        title="Mark as read"
                    >
                        <FiCheck className="h-3.5 w-3.5" />
                    </button>
                )}
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(id); }}
                    className="rounded p-1 text-gray-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                    title="Delete notification"
                >
                    <FiTrash2 className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    );
};

export default NotificationCard;
