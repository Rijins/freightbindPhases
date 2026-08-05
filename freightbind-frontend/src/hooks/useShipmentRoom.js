import { useCallback, useEffect, useRef } from "react";
import useSocket from "./useSocket";
import { SOCKET_EVENTS } from "../utils/constants";
import { buildShipmentRoom } from "../utils/socketRooms";

/**
 * Joins the shipment room for a shipment the current page is viewing, so the
 * server can deliver shipment:status-changed / shipment:assigned /
 * shipment:updated / timeline:updated events for exactly that shipment.
 *
 * - Emits `room:join` on mount (once socket is connected) and re-emits it on
 *   every reconnect — the server drops all rooms when a socket disconnects.
 * - Emits `room:leave` on unmount / when the shipment id changes.
 * - Guards against duplicate join emissions and invalid ids (never throws).
 */
const useShipmentRoom = (shipmentId) => {
  const { socket, eventManager } = useSocket();
  const activeRoomRef = useRef(null);
  const shipmentIdRef = useRef(shipmentId);
  shipmentIdRef.current = shipmentId;

  const join = useCallback(() => {
    const id = shipmentIdRef.current;
    if (!id) return;
    let room;
    try {
      room = buildShipmentRoom(id);
    } catch {
      // Invalid Mongo id in the URL — the API fetch will surface the real
      // error; the socket must never crash on it.
      activeRoomRef.current = null;
      return;
    }
    if (room === activeRoomRef.current) return;
    if (socket?.connected) {
      socket.emit(SOCKET_EVENTS.ROOM_JOIN, room);
    }
    activeRoomRef.current = room;
  }, [socket]);

  const leave = useCallback(() => {
    const room = activeRoomRef.current;
    if (!room) return;
    try {
      socket?.emit(SOCKET_EVENTS.ROOM_LEAVE, room);
    } catch {
      // Best-effort — server cleans up rooms on disconnect anyway.
    }
    activeRoomRef.current = null;
  }, [socket]);

  // Join as soon as the socket is connected (also covers the case where the
  // socket finished connecting before this page mounted).
  useEffect(() => {
    if (socket?.connected) join();
  }, [socket, join]);

  // Rejoin on every (re)connect. The server drops ALL rooms when a socket
  // disconnects, so the guard below must NOT suppress a re-join after a
  // reconnect: the disconnect listener forgets the active room, making the
  // next connect re-emit room:join exactly once.
  useEffect(() => {
    if (!eventManager) return undefined;
    const forget = () => {
      activeRoomRef.current = null;
    };
    eventManager.on(SOCKET_EVENTS.CONNECT, join);
    eventManager.on(SOCKET_EVENTS.DISCONNECT, forget);
    return () => {
      eventManager.off(SOCKET_EVENTS.CONNECT, join);
      eventManager.off(SOCKET_EVENTS.DISCONNECT, forget);
    };
  }, [eventManager, join]);

  // Leave on unmount / shipment change.
  useEffect(() => () => leave(), [leave]);
};

export default useShipmentRoom;
