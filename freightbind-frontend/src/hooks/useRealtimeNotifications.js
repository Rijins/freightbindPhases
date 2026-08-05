import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useSocket from './useSocket';
import { SOCKET_EVENTS } from '../utils/constants';
import {
  realtimeNotificationReceived,
  realtimeMarkRead,
  realtimeMarkAllRead,
  realtimeSetCount,
  fetchNotifications,
  fetchUnreadCount,
  buildQueryParams,
} from '../features/notifications/notificationSlice';
import {
  recordNotificationEvent,
  recordAppliedNotification,
} from '../socket/notificationStats';

/**
 * Registers the app-wide realtime notification listeners on the shared
 * SocketEventManager (the one created by SocketProvider). It is mounted once
 * from AppLayout (authenticated shell only).
 *
 * - Registers exactly once: the ref guard + the manager's (event, handler)
 *   dedupe make duplicate listeners impossible.
 * - Reuses the existing SocketProvider + eventManager (never touches
 *   socket.on()/off() directly).
 * - Wires every event into the existing notification slice reducers, so the
 *   badge and lists update with no page refresh.
 * - On every connect (login AND reconnection) it re-pulls the authoritative
 *   unread count and the currently-viewed list, restoring any notifications
 *   that were persisted in MongoDB while the socket was down (no loss).
 * - Cleanup relies on the provider's eventManager.offAll() on logout /
 *   socket teardown, which removes every listener (ours included).
 */
const useRealtimeNotifications = () => {
  const dispatch = useDispatch();
  const { socket, eventManager } = useSocket();

  const { filters, search, page, limit } = useSelector((state) => ({
    filters: state.notifications.filters,
    search: state.notifications.search,
    page: state.notifications.pagination.page,
    limit: state.notifications.pagination.limit,
  }));
  const viewRef = useRef({ filters, search, page, limit });
  viewRef.current = { filters, search, page, limit };

  const registeredRef = useRef(false);

  useEffect(() => {
    if (!eventManager) return undefined;

    if (!registeredRef.current) {
      registeredRef.current = true;

      const handleConnect = () => {
        // Login + reconnect sync — restores missed notifications from MongoDB.
        dispatch(fetchUnreadCount());
        const view = viewRef.current;
        dispatch(
          fetchNotifications(buildQueryParams({ ...view, page: 1 }))
        );
      };

      const handleNew = (payload) => {
        if (import.meta.env.DEV) recordNotificationEvent(SOCKET_EVENTS.NOTIFICATION);
        dispatch(realtimeNotificationReceived(payload));
        if (import.meta.env.DEV) recordAppliedNotification();
      };

      const handleRead = (payload) => {
        if (import.meta.env.DEV) recordNotificationEvent(SOCKET_EVENTS.NOTIFICATION_READ);
        dispatch(realtimeMarkRead(payload || {}));
      };

      const handleReadAll = () => {
        if (import.meta.env.DEV) recordNotificationEvent(SOCKET_EVENTS.NOTIFICATION_READ_ALL);
        dispatch(realtimeMarkAllRead());
      };

      const handleCount = (payload) => {
        if (import.meta.env.DEV) recordNotificationEvent(SOCKET_EVENTS.NOTIFICATION_COUNT);
        dispatch(realtimeSetCount(payload || {}));
      };

      const handleError = (payload) => {
        if (import.meta.env.DEV) recordNotificationEvent(SOCKET_EVENTS.NOTIFICATION_ERROR);
        if (import.meta.env.DEV) {
          console.warn('[notification] realtime error payload:', payload);
        }
      };

      eventManager
        .on(SOCKET_EVENTS.CONNECT, handleConnect)
        .on(SOCKET_EVENTS.NOTIFICATION, handleNew)
        .on(SOCKET_EVENTS.NOTIFICATION_READ, handleRead)
        .on(SOCKET_EVENTS.NOTIFICATION_READ_ALL, handleReadAll)
        .on(SOCKET_EVENTS.NOTIFICATION_COUNT, handleCount)
        .on(SOCKET_EVENTS.NOTIFICATION_ERROR, handleError);
    }

    // If a socket already exists (e.g. provider effect ran before this hook
    // mounted), wire the newly registered handlers. The manager's
    // per-socket idempotency guard makes this a no-op when already attached.
    if (socket) {
      eventManager.attach(socket);
    }

    return undefined;
  }, [socket, eventManager, dispatch]);
};

export default useRealtimeNotifications;