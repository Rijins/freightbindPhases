import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import useSocket from "./useSocket";
import { SOCKET_EVENTS } from "../utils/constants";
import {
  fetchShipments,
  fetchShipmentById,
  realtimeShipmentUpdated,
  realtimeShipmentDetail,
} from "../features/shipments/shipmentSlice";
import {
  refreshTimeline,
  realtimeTimelineAppended,
} from "../features/timeline/timelineSlice";

/**
 * App-wide shipment/timeline realtime listeners, mounted once from AppLayout
 * (same pattern as useRealtimeNotifications).
 *
 * - Registers exactly once: the ref guard + the manager's (event, handler)
 *   dedupe make duplicate listeners impossible.
 * - `shipment:updated` (role-level, every change) keeps the shipment list in
 *   sync — rows are updated in place only, so pagination/search/filter state
 *   is never touched and no new rows are injected.
 * - `shipment:status-changed` / `shipment:assigned` / `shipment:updated`
 *   (shipment-room) keep the currently viewed shipment detail in sync. Both
 *   reducer paths are idempotent (replace by _id), so a user who belongs to
 *   both their role room and the shipment room never sees duplicate updates.
 * - `timeline:updated` appends new entries to the open timeline, deduped by
 *   event _id so rapid mutations / optimistic pushes never duplicate rows.
 * - On every connect (login AND reconnection) the active shipment, its
 *   timeline, and the current list are re-pulled from MongoDB, restoring
 *   anything that changed while the socket was down (no loss, no duplicates).
 * - `room:error` is swallowed (dev-logged) — the app never crashes on a bad
 *   room name.
 */
const useRealtimeShipments = () => {
  const dispatch = useDispatch();
  const { socket, eventManager } = useSocket();

  const query = useSelector((state) => state.shipments.query);
  const selectedId = useSelector((state) => state.shipments.selected?._id ?? null);
  const timelineShipmentId = useSelector((state) => state.timeline.selectedShipment);

  // Latest view state, readable inside stable listeners without re-registering.
  const viewRef = useRef({ query, selectedId, timelineShipmentId });
  viewRef.current = { query, selectedId, timelineShipmentId };

  const registeredRef = useRef(false);

  useEffect(() => {
    if (!eventManager) return undefined;

    if (!registeredRef.current) {
      registeredRef.current = true;

      const handleConnect = () => {
        const view = viewRef.current;
        dispatch(fetchShipments(view.query));
        if (view.selectedId) dispatch(fetchShipmentById(view.selectedId));
        if (view.timelineShipmentId) dispatch(refreshTimeline(view.timelineShipmentId));
      };

      const handleShipmentUpdated = (payload) => {
        dispatch(realtimeShipmentUpdated(payload));
      };

      const handleShipmentDetail = (payload) => {
        dispatch(realtimeShipmentDetail(payload));
      };

      const handleTimelineUpdated = (payload) => {
        dispatch(realtimeTimelineAppended(payload));
      };

      const handleRoomError = (payload) => {
        if (import.meta.env.DEV) {
          console.warn("[shipment] room error:", payload?.message || payload);
        }
      };

      eventManager
        .on(SOCKET_EVENTS.CONNECT, handleConnect)
        .on(SOCKET_EVENTS.SHIPMENT_UPDATED, handleShipmentUpdated)
        .on(SOCKET_EVENTS.SHIPMENT_STATUS_CHANGED, handleShipmentDetail)
        .on(SOCKET_EVENTS.SHIPMENT_ASSIGNED, handleShipmentDetail)
        .on(SOCKET_EVENTS.TIMELINE_UPDATED, handleTimelineUpdated)
        .on(SOCKET_EVENTS.ROOM_ERROR, handleRoomError);
    }

    // If a socket already exists (e.g. provider effect ran before this hook
    // mounted), wire the newly registered handlers. The manager's per-socket
    // idempotency guard makes this a no-op when already attached.
    if (socket) {
      eventManager.attach(socket);
    }

    return undefined;
  }, [socket, eventManager, dispatch]);
};

export default useRealtimeShipments;
