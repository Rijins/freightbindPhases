import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import notificationService from '../../services/notificationService';

// --- Async Thunks ---

export const fetchNotifications = createAsyncThunk(
    'notifications/fetchNotifications',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await notificationService.getNotifications(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchUnreadCount = createAsyncThunk(
    'notifications/fetchUnreadCount',
    async (_, { rejectWithValue }) => {
        try {
            const response = await notificationService.getUnreadCount();
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const markAsRead = createAsyncThunk(
    'notifications/markAsRead',
    async (id, { rejectWithValue }) => {
        try {
            await notificationService.markAsRead(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const markAllAsRead = createAsyncThunk(
    'notifications/markAllAsRead',
    async (_, { rejectWithValue, dispatch, getState }) => {
        try {
            await notificationService.markAllAsRead();
            // Re-fetch with the current filters/search/page still applied,
            // instead of silently resetting the view to an unfiltered page 1.
            const { filters, search, pagination } = getState().notifications;
            dispatch(fetchNotifications(buildQueryParams({ filters, search, page: pagination.page, limit: pagination.limit })));
            dispatch(fetchUnreadCount());
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const deleteNotification = createAsyncThunk(
    'notifications/deleteNotification',
    async (id, { rejectWithValue }) => {
        try {
            await notificationService.deleteNotification(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const deleteReadNotifications = createAsyncThunk(
    'notifications/deleteReadNotifications',
    async (_, { rejectWithValue, dispatch, getState }) => {
        try {
            await notificationService.deleteReadNotifications();
            const { filters, search, pagination } = getState().notifications;
            dispatch(fetchNotifications(buildQueryParams({ filters, search, page: pagination.page, limit: pagination.limit })));
            dispatch(fetchUnreadCount());
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// --- Query param helper ---
// Single source of truth for turning { filters, search, page, limit } into
// the exact query params the backend accepts. Used by loadMore (in
// useNotifications.js) AND by the re-fetches above so the two never drift
// apart again.
//
// IMPORTANT: filters.status maps to a backend `read` boolean, and
// filters.priority / filters.type must already be in the backend's exact
// casing (e.g. "High", "Shipment Created") — the <select> options in
// Notifications.jsx are responsible for supplying that casing as their
// `value`, since the UI labels themselves are lowercase for display.
export const buildQueryParams = ({ filters, search, page, limit }) => {
    const queryParams = {
        page,
        limit,
        ...(search && { search }),
    };

    if (filters.status === 'unread') queryParams.read = false;
    else if (filters.status === 'read') queryParams.read = true;
    // 'all' sends no read param → returns all notifications

    if (filters.priority && filters.priority !== 'all') queryParams.priority = filters.priority;
    if (filters.type && filters.type !== 'all') queryParams.type = filters.type;

    return queryParams;
};

// --- Normalization ---

// Single normalization used by BOTH the REST fetch handler and the realtime
// socket handler, so a notification rendered from a socket `notification:new`
// event is identical in shape to one rendered from GET /notifications.
// Handles raw Mongo docs (_id / isRead / populated relatedShipment) and the
// pre-serialized socket payload (id / read / relatedShipment: { id, shipmentId }).
export const normalizeNotification = (raw) => {
    if (!raw || typeof raw !== 'object') return null;

    const relatedShipment = raw.relatedShipment || null;

    return {
        ...raw,
        id: raw.id || raw._id,
        read: raw.read ?? raw.isRead ?? false,
        // Normalized for icon/style matching in NotificationCard only —
        // NOT used for building filter query params (see buildQueryParams,
        // which needs the backend's original casing instead).
        type: (raw.type || '').toLowerCase().replace(/\s+/g, '_'),
        priority: (raw.priority || '').toLowerCase(),
        // Derive a flat shipmentId — prefer the human-readable shipmentId
        // (e.g. "FB-...") over the raw Mongo _id, which would otherwise win
        // here since populated docs always include _id even when not
        // explicitly selected.
        shipmentId: raw.shipmentId || relatedShipment?.shipmentId || relatedShipment?._id || null,
    };
};

// --- Slice Definition ---

const initialState = {
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
    pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
    },
    filters: {
        status: 'all',
        priority: 'all',
        type: 'all',
    },
    search: '',
    drawerOpen: false,
};

const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        setDrawerOpen: (state, action) => {
            state.drawerOpen = action.payload;
        },
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
            state.pagination.page = 1;
        },
        setSearch: (state, action) => {
            state.search = action.payload;
            state.pagination.page = 1;
        },
        setPage: (state, action) => {
            state.pagination.page = action.payload;
        },
        // --- Realtime reducers (driven by the socket listener) ---
        // Prepends a freshly emitted notification without any refetch. The
        // backend follows each emit with an authoritative `notification:count`,
        // so the optimistic +1 here is always corrected moments later.
        realtimeNotificationReceived: (state, action) => {
            const notification = normalizeNotification(action.payload);
            if (!notification) return;

            // Dedupe: never render the same notification twice, even if the
            // socket event is re-emitted after a reconnect.
            if (state.notifications.some((n) => n.id === notification.id)) return;

            state.notifications = [notification, ...state.notifications];
            state.unreadCount += 1;
        },
        realtimeMarkRead: (state, action) => {
            const id = action.payload?.id;
            if (!id) return;

            const index = state.notifications.findIndex((n) => n.id === id);
            if (index !== -1 && !state.notifications[index].read) {
                state.notifications[index].read = true;
                state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
        },
        realtimeMarkAllRead: (state) => {
            state.notifications = state.notifications.map((n) => ({ ...n, read: true }));
            state.unreadCount = 0;
        },
        realtimeSetCount: (state, action) => {
            const count = action.payload?.count;
            if (typeof count === 'number') state.unreadCount = count;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            // Unwrap the backend envelope: { success, message, data: { notifications, pagination } }
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.loading = false;

                const payload = action.payload;
                const responseData = payload?.data ?? payload;

                const rawNotifications = Array.isArray(responseData?.notifications)
                    ? responseData.notifications
                    : [];

                const rawPagination = responseData?.pagination ?? {};

                state.notifications = rawNotifications.map(normalizeNotification).filter(Boolean);

                state.pagination = {
                    page: rawPagination.currentPage || rawPagination.page || 1,
                    limit: rawPagination.limit || 20,
                    total: rawPagination.totalItems || rawPagination.total || 0,
                    totalPages: rawPagination.totalPages || 1,
                };
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Safe unread count extraction: backend returns { data: { count } }
            .addCase(fetchUnreadCount.fulfilled, (state, action) => {
                const payload = action.payload;
                state.unreadCount = typeof payload === 'number'
                    ? payload
                    : (payload?.count ?? payload?.data?.count ?? 0);
            })
            .addCase(markAsRead.fulfilled, (state, action) => {
                const index = state.notifications.findIndex((n) => n.id === action.payload);
                // Only decrement when this action actually flipped an unread
                // notification — the backend also pushes notification:read +
                // notification:count over the socket, so an unguarded decrement
                // here would double-count when the socket event lands first.
                if (index !== -1 && !state.notifications[index].read) {
                    state.notifications[index].read = true;
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
            })
            .addCase(markAllAsRead.fulfilled, (state) => {
                state.notifications = state.notifications.map((n) => ({ ...n, read: true }));
                state.unreadCount = 0;
            })
            .addCase(deleteNotification.fulfilled, (state, action) => {
                state.notifications = state.notifications.filter((n) => n.id !== action.payload);
            })
            .addCase(deleteNotification.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export const {
    setDrawerOpen,
    setFilters,
    setSearch,
    setPage,
    realtimeNotificationReceived,
    realtimeMarkRead,
    realtimeMarkAllRead,
    realtimeSetCount,
    clearError,
} = notificationSlice.actions;

export default notificationSlice.reducer;