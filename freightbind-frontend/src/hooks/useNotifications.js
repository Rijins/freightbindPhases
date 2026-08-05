import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteReadNotifications,
    setDrawerOpen,
    setFilters,
    setSearch,
    setPage,
    buildQueryParams,
} from '../features/notifications/notificationSlice';

const useNotifications = () => {
    const dispatch = useDispatch();
    const {
        notifications,
        unreadCount,
        loading,
        error,
        pagination,
        filters,
        search,
        drawerOpen,
    } = useSelector((state) => state.notifications);

    useEffect(() => {
        dispatch(fetchNotifications({ page: 1, limit: 20 }));
        dispatch(fetchUnreadCount());
    }, [dispatch]);

    const loadMore = (page) => {
        dispatch(setPage(page));

        // Shared with markAllAsRead / deleteReadNotifications in the slice so
        // filter → query-param translation never drifts between call sites.
        const queryParams = buildQueryParams({ filters, search, page, limit: pagination.limit });

        dispatch(fetchNotifications(queryParams));
    };

    const toggleDrawer = (isOpen) => {
        dispatch(setDrawerOpen(isOpen));
        if (isOpen) {
            dispatch(fetchNotifications({ page: 1, limit: 10 }));
        }
    };

    const handleMarkRead = (id) => dispatch(markAsRead(id));
    const handleMarkAllRead = () => dispatch(markAllAsRead());
    const handleDelete = (id) => dispatch(deleteNotification(id));
    const handleDeleteRead = () => dispatch(deleteReadNotifications());

    const updateFilters = (newFilters) => dispatch(setFilters(newFilters));
    const updateSearch = (term) => dispatch(setSearch(term));

    return {
        notifications,
        unreadCount,
        loading,
        error,
        pagination,
        filters,
        search,
        drawerOpen,
        actions: {
            loadMore,
            toggleDrawer,
            handleMarkRead,
            handleMarkAllRead,
            handleDelete,
            handleDeleteRead,
            updateFilters,
            updateSearch,
        },
    };
};

export default useNotifications;