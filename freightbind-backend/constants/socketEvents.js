// All socket event names live here. Never hardcode event strings elsewhere
// in the project — this file is the single source of truth for both the
// server (sockets/, services/socketService.js) and, in a future phase, the
// frontend.

const SOCKET_EVENTS = Object.freeze({
    // Lifecycle (Socket.IO built-ins, aliased for consistency)
    CONNECTION: "connection",
    DISCONNECT: "disconnect",
    CONNECT_ERROR: "connect_error",

    // Domain events (server -> client)
    NOTIFICATION: "notification:new",
    NOTIFICATION_READ: "notification:read",
    NOTIFICATION_READ_ALL: "notification:read-all",
    NOTIFICATION_COUNT: "notification:count",
    NOTIFICATION_ERROR: "notification:error",
    SHIPMENT_UPDATED: "shipment:updated",
    SHIPMENT_ASSIGNED: "shipment:assigned",
    SHIPMENT_STATUS_CHANGED: "shipment:status-changed",
    TIMELINE_UPDATED: "timeline:updated",
    USER_ONLINE: "user:online",
    USER_OFFLINE: "user:offline",
    AI_ALERT: "ai:alert",
    SYSTEM_ALERT: "system:alert",
    CHAT_MESSAGE: "chat:message",

    // Protocol events (client <-> server)
    AUTH_ERROR: "auth:error",
    ROOM_JOIN: "room:join",
    ROOM_LEAVE: "room:leave",
    ROOM_ERROR: "room:error",
});

module.exports = { SOCKET_EVENTS };
