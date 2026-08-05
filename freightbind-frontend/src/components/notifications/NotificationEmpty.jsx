import React from 'react';
import { FiBellOff } from 'react-icons/fi';


const NotificationEmpty = ({ message = "No notifications found" }) => {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-zinc-800">
                <FiBellOff className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">{message}</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
                You're all caught up!
            </p>
        </div>
    );
};

export default NotificationEmpty;
