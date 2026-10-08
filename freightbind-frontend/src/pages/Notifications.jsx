import React, { useEffect, useState } from 'react';
import { FiSearch, FiCheckCircle, FiTrash2, FiChevronLeft, FiChevronRight, FiBell, FiAlertCircle, FiAlertTriangle, FiCalendar } from 'react-icons/fi';
import useNotifications from '../hooks/useNotifications';
import useDebounce from '../hooks/useDebounce';
import StatCard from '../components/Card/StatCard';
import NotificationList from '../components/notifications/NotificationList';
import NotificationEmpty from '../components/notifications/NotificationEmpty';

const Notifications = () => {
    const { notifications, loading, unreadCount, pagination, filters, search, actions } = useNotifications();

    // Debounce the raw input locally so every keystroke doesn't fire a
    // request — only push to Redux (and therefore trigger a fetch) once
    // typing pauses.
    const [searchInput, setSearchInput] = useState(search);
    const debouncedSearch = useDebounce(searchInput, 400);

    useEffect(() => {
        if (debouncedSearch !== search) {
            actions.updateSearch(debouncedSearch);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch]);

    useEffect(() => {
        actions.loadMore(pagination.page);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, search, pagination.page]);

    return (
        <div className="min-h-screen bg-slate-50 p-6 dark:bg-zinc-950">
            <div className="mx-auto max-w-5xl">
                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-display text-navy-900 dark:text-white">Notifications</h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">Manage and track all your shipment updates</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {unreadCount > 0 && (
                            <button onClick={actions.handleMarkAllRead} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700">
                                <FiCheckCircle className="h-4 w-4" /> Mark All Read
                            </button>
                        )}
                        <button onClick={actions.handleDeleteRead} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 shadow-sm hover:bg-red-50 disabled:opacity-50 dark:border-red-900/50 dark:bg-zinc-800 dark:text-red-400 dark:hover:bg-red-900/20">
                            <FiTrash2 className="h-4 w-4" /> Delete Read
                        </button>
                    </div>
                </div>

                {/* Filter Bar with Status, Priority & Type */}
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search notifications..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
                        />
                    </div>

                    <select value={filters.status} onChange={(e) => actions.updateFilters({ status: e.target.value })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        <option value="all">All Status</option>
                        <option value="unread">Unread</option>
                        <option value="read">Read</option>
                    </select>

                    {/*
                        IMPORTANT: `value` here must match the backend's exact enum
                        casing (constants/notificationTypes.js → NOTIFICATION_PRIORITIES_LIST),
                        since it's sent as-is in the `priority` query param and validated
                        with a case-sensitive express-validator `.isIn(...)`. The label
                        text can stay lowercase/friendly; only `value` has to match.
                    */}
                    <select value={filters.priority} onChange={(e) => actions.updateFilters({ priority: e.target.value })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        <option value="all">All Priorities</option>
                        <option value="Critical">Critical</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>

                    {/* Same rule as above — values match NOTIFICATION_TYPES_LIST exactly. */}
                    <select value={filters.type} onChange={(e) => actions.updateFilters({ type: e.target.value })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        <option value="all">All Types</option>
                        <option value="Shipment Created">Created</option>
                        <option value="Shipment Updated">Updated</option>
                        <option value="Shipment Assigned">Assigned</option>
                        <option value="Shipment Delayed">Delayed</option>
                        <option value="Shipment Delivered">Delivered</option>
                        <option value="Shipment Cancelled">Cancelled</option>
                        <option value="Timeline Event">Timeline Event</option>
                        <option value="System Announcement">System Announcement</option>
                        <option value="Chat Message">Chat Message</option>
                    </select>
                </div>

                {/* Stats Summary */}
                <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <StatCard icon={FiBell} title="Total" value={pagination.total || notifications.length} />
                    <StatCard icon={FiAlertCircle} title="Unread" value={unreadCount} />
                    <StatCard icon={FiAlertTriangle} title="High Priority" value={notifications.filter(n => n.priority === 'high').length} />
                    <StatCard icon={FiCalendar} title="This Week" value={notifications.filter(n => { const d = new Date(n.createdAt); const weekAgo = new Date(Date.now() - 7 * 86400000); return d > weekAgo; }).length} />
                </div>

                {/* Notification List & Pagination */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
                    {notifications.length > 0 || loading ? (
                        <>
                            <NotificationList notifications={notifications} loading={loading} onMarkRead={actions.handleMarkRead} onDelete={actions.handleDelete} />
                            {pagination.totalPages > 1 && (
                                <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/50">
                                    <p className="text-xs text-slate-500 dark:text-zinc-400">Page {pagination.page} of {pagination.totalPages}</p>
                                    <div className="flex gap-2">
                                        <button onClick={() => actions.loadMore(pagination.page - 1)} disabled={pagination.page <= 1} className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"><FiChevronLeft className="h-4 w-4" /></button>
                                        <button onClick={() => actions.loadMore(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages} className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"><FiChevronRight className="h-4 w-4" /></button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <NotificationEmpty message="No notifications match your filters" />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Notifications;