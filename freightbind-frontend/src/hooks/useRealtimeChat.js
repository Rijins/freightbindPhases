import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import useSocket from "./useSocket";
import { SOCKET_EVENTS } from "../utils/constants";
import { realtimeMessageReceived } from "../features/chat/chatSlice";

/**
 * Registers the shipment chat realtime listener on the shared
 * SocketEventManager (the one owned by SocketProvider). Never touches
 * socket.on()/off() directly — follows the existing app-wide realtime
 * architecture (Backend -> Socket.IO -> SocketProvider -> eventManager
 * -> Redux).
 *
 * - Listens for `chat:message` and appends ONLY messages whose shipmentId
 *   matches the chat currently open, so unrelated conversations are never
 *   mixed in (the backend also scopes delivery to participants only).
 * - The manager's (event, handler) dedupe prevents duplicate listeners on
 *   re-mounts.
 */
const useRealtimeChat = (shipmentId) => {
  const dispatch = useDispatch();
  const { socket, eventManager } = useSocket();
  const shipmentIdRef = useRef(shipmentId);
  shipmentIdRef.current = shipmentId;

  useEffect(() => {
    if (!eventManager || !shipmentId) return undefined;

    const handler = (payload) => {
      if (!payload || !payload.shipmentId) return;
      if (String(payload.shipmentId) !== String(shipmentIdRef.current)) return;
      dispatch(realtimeMessageReceived(payload.message));
    };

    eventManager.on(SOCKET_EVENTS.CHAT_MESSAGE, handler);

    // If the socket already exists (the provider attaches it on login, long
    // before any chat page can mount), wire the newly registered handler —
    // the manager's per-socket idempotency guard makes this a no-op when
    // already attached. Without this the `chat:message` event would arrive
    // at the socket but never reach Redux (same pattern as
    // useRealtimeNotifications / useRealtimeShipments).
    if (socket) {
      eventManager.attach(socket);
    }

    return () => {
      eventManager.off(SOCKET_EVENTS.CHAT_MESSAGE, handler);
    };
  }, [dispatch, socket, eventManager, shipmentId]);
};

export default useRealtimeChat;
