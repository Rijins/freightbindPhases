import React from 'react';
import NotificationEmpty from './NotificationEmpty';
import NotificationCard from './NotificationCard';
import NotificationLoading from './NotificationLoading';


const NotificationList = ({
    notifications,
    loading,
    onMarkRead,
    onDelete
}) => {
    if (loading && notifications.length === 0) {
        return <NotificationLoading />;
    }

    if (!loading && notifications.length === 0) {
        return <NotificationEmpty />;
    }

    return (
        <div className="max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-zinc-600">
            {notifications.map((notification) => (
                <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onMarkRead={onMarkRead}
                    onDelete={onDelete}
                />
            ))}

            {loading && notifications.length > 0 && (
                <div className="p-4">
                    <NotificationLoading count={2} />
                </div>
            )}
        </div>
    );
};

export default NotificationList;
