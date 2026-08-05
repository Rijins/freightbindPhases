import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import useSocket from "./useSocket";
import { SOCKET_EVENTS } from "../utils/constants";
import {
  dashboardShipmentApplied,
  dashboardActivityAppended,
} from "../features/dashboard/dashboardSlice";

/**
 * useDashboardSync — the single reusable dashboard synchronization hook
 * (Phase 7 Part 5). Mounted once per dashboard via useAdminDashboardData, so
 * every Command Center inherits the same realtime behaviour.
 *
 * It reuses the EXISTING realtime infrastructure — no new socket events, no
 * polling, no duplicate listeners:
 *   - Shipment events (shipment:updated / status-changed / assigned) are
 *     consumed directly for KPI/overview/activity coordination. The existing
 *     useRealtimeShipments listener keeps the shipments store in sync; this
 *     hook only translates the same events into minimal dashboard deltas.
 *   - Notification activity is WATCHED from the notifications store (already
 *     fed by the existing useRealtimeNotifications listener) — no second
 *     notification listener is registered.
 *   - Reconnect recovery reuses the existing connect lifecycle: on any
 *     connect AFTER the first one, the REST seed (counts, overview,
 *     notifications, activity) is re-pulled once via the caller's onRefresh
 *     — no duplicate fetches, no duplicate socket events.
 *
 * Role scoping: a `scope.assignedDispatcher` (Carrier Dispatcher) makes the
 * hook ignore events for shipments that are not assigned to that user, so
 * role dashboards only ever reflect their authorized dataset.
 */
const useDashboardSync = ({ onRefresh, scope }) => {
  const dispatch = useDispatch();
  const { socket, eventManager } = useSocket();

  const notifications = useSelector((state) => state.notifications.notifications);
  const lastSeedAt = useSelector((state) => state.dashboard.lastSeedAt);

  // Latest props, readable inside stable listeners without re-registering.
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;
  const scopeRef = useRef(scope);
  scopeRef.current = scope;

  // Transition tracker: previous status/priority per shipment id, so count
  // deltas are only applied for real transitions and idempotent duplicate
  // emissions are harmless.
  const knownByIdRef = useRef(new Map());
  const knownNotifIdsRef = useRef(new Set());
  const seededAtRef = useRef(Date.now());
  const connectedOnceRef = useRef(false);
  const registeredRef = useRef(false);
  const lastSeedAtRef = useRef(lastSeedAt);

  // Every REST seed (initial load AND reconnect recovery) resets the tracker:
  // event deltas are always computed against the authoritative counts, and
  // "new shipment" detection restarts from the seed moment.
  useEffect(() => {
    if (lastSeedAt && lastSeedAt !== lastSeedAtRef.current) {
      lastSeedAtRef.current = lastSeedAt;
      knownByIdRef.current = new Map();
      knownNotifIdsRef.current = new Set();
      seededAtRef.current = Date.now();
    }
  }, [lastSeedAt]);

  // If the socket is ALREADY connected when the dashboard mounts (navigated
  // here after login), the first connect event this hook ever observes is a
  // RECONNECTION — the mount-time REST seed already covered the initial
  // connect, so that first reconnect must trigger the full restore instead
  // of being skipped as the "initial connection".
  useEffect(() => {
    if (socket?.connected && !connectedOnceRef.current) {
      connectedOnceRef.current = true;
    }
  }, [socket]);

  // Watch the notifications store (fed by useRealtimeNotifications + REST
  // fetches) and append fresh entries to the dashboard feed. Deduped by id on
  // both sides, so whole-list re-fetches can never duplicate feed rows.
  useEffect(() => {
    const known = knownNotifIdsRef.current;
    const fresh = notifications.filter((notification) => {
      const id = notification?.id ?? notification?._id;
      if (!id || known.has(id)) return false;
      known.add(id);
      return true;
    });
    if (fresh.length) {
      dispatch(dashboardActivityAppended({ entries: fresh }));
    }
  }, [notifications, dispatch]);

  useEffect(() => {
    if (!eventManager) return undefined;

    if (!registeredRef.current) {
      registeredRef.current = true;

      const applyShipmentEvent = (payload) => {
        const shipment = payload?.shipment || payload;
        if (!shipment?._id) return;

        // Role scope: Carrier Dispatchers only track their own shipments.
        const currentScope = scopeRef.current;
        if (currentScope?.assignedDispatcher) {
          const assigned = shipment.assignedDispatcher?._id ?? shipment.assignedDispatcher;
          if (
            assigned === undefined ||
            String(assigned) !== String(currentScope.assignedDispatcher)
          ) {
            return;
          }
        }

        const tracker = knownByIdRef.current;
        const tracked = tracker.get(shipment._id);
        // Idempotency guard: an already-applied status must never be applied
        // again, even when a second event for the same change arrives (e.g.
        // shipment-room event + role-level event).
        const alreadySynced = tracked && tracked.status === shipment.status;
        const previousStatus = alreadySynced
          ? tracked.status
          : payload?.previousStatus || tracked?.status;
        const previousPriority = tracked?.priority;
        const isNew =
          !tracked &&
          new Date(shipment.createdAt).getTime() >= seededAtRef.current;

        tracker.set(shipment._id, {
          status: shipment.status,
          priority: shipment.priority,
          updatedAt: shipment.updatedAt,
        });

        dispatch(
          dashboardShipmentApplied({ shipment, previousStatus, previousPriority, isNew })
        );
      };

      const handleConnect = () => {
        // First connect after mount: the mount-time REST seed already covers
        // the dashboard — skip. Any later connect is a reconnection, so
        // restore everything (KPIs, overview, notifications, activity,
        // timeline) through the existing REST seed path, exactly once.
        if (!connectedOnceRef.current) {
          connectedOnceRef.current = true;
          return;
        }
        onRefreshRef.current?.();
      };

      const handleShipmentUpdated = (payload) => applyShipmentEvent(payload);
      const handleShipmentStatusChanged = (payload) => applyShipmentEvent(payload);
      const handleShipmentAssigned = (payload) => applyShipmentEvent(payload);

      eventManager
        .on(SOCKET_EVENTS.CONNECT, handleConnect)
        .on(SOCKET_EVENTS.SHIPMENT_UPDATED, handleShipmentUpdated)
        .on(SOCKET_EVENTS.SHIPMENT_STATUS_CHANGED, handleShipmentStatusChanged)
        .on(SOCKET_EVENTS.SHIPMENT_ASSIGNED, handleShipmentAssigned);
    }

    // If a socket already exists (e.g. provider effect ran before this hook
    // mounted), wire the newly registered handlers. The manager's per-socket
    // idempotency guard makes this a no-op when already attached.
    if (socket) {
      eventManager.attach(socket);
    }

    return undefined;
  }, [socket, eventManager, dispatch]);

  return null;
};

export default useDashboardSync;
