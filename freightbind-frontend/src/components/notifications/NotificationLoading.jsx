import React from 'react';

const NotificationLoading = ({ count = 5 }) => {
    return (
        <div className="space-y-0">
            {[...Array(count)].map((_, i) => (
                <div
                    key={i}
                    className="flex items-start gap-3 border-b border-gray-100 p-4 animate-pulse dark:border-zinc-800"
                >
                    {/* Icon Skeleton */}
                    <div className="mt-0.5 h-8 w-8 rounded-full bg-slate-200 dark:bg-zinc-700" />

                    {/* Content Skeleton */}
                    <div className="flex-1 space-y-2">
                        <div className="flex justify-between">
                            <div className="h-3 w-24 rounded bg-slate-200 dark:bg-zinc-700" />
                            <div className="h-3 w-12 rounded bg-slate-200 dark:bg-zinc-700" />
                        </div>
                        <div className="h-3 w-full rounded bg-slate-200 dark:bg-zinc-700" />
                        <div className="h-3 w-2/3 rounded bg-slate-200 dark:bg-zinc-700" />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default NotificationLoading;
