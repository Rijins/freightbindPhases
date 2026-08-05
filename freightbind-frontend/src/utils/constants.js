// Mirrors backend constants exactly (constants/roles.js, models/Shipment.js).
// Never invent values here that the backend does not already define.

import { FiBell, FiGrid, FiPlusCircle, FiTruck } from "react-icons/fi";

export const ROLES = Object.freeze({
  ADMIN: "Admin",
  LOGISTICS_DIRECTOR: "Logistics Director",
  CARRIER_DISPATCHER: "Carrier Dispatcher",
  HUB_OPERATOR: "Hub Operator",
});

export const ROLES_LIST = Object.values(ROLES);

export const SHIPMENT_STATUSES = [
  "Draft",
  "Created",
  "Scheduled",
  "In Transit",
  "Delayed",
  "Delivered",
  "Cancelled",
];

export const SHIPMENT_PRIORITIES = ["Low", "Medium", "High", "Critical"];

// Roles allowed to create / delete shipments (routes/shipmentRoutes.js)
export const CAN_CREATE_SHIPMENT_ROLES = [ROLES.ADMIN, ROLES.LOGISTICS_DIRECTOR];
export const CAN_DELETE_SHIPMENT_ROLES = [ROLES.ADMIN, ROLES.LOGISTICS_DIRECTOR];

export const SORT_FIELDS = [
  { value: "createdAt", label: "Created Date" },
  { value: "updatedAt", label: "Updated Date" },
  { value: "priority", label: "Priority" },
  { value: "status", label: "Status" },
  { value: "estimatedArrival", label: "Estimated Arrival" },
];

export const DEFAULT_PAGE_SIZE = 10;

export const TOKEN_STORAGE_KEY = "freightbind_token";
export const USER_STORAGE_KEY = "freightbind_user";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

// Socket.IO shares the backend's HTTP server, so the socket origin is the
// API origin. VITE_SOCKET_URL is an explicit override for deployments where
// the realtime server lives elsewhere.
export const SOCKET_URL = (() => {
  try {
    return (
      import.meta.env.VITE_SOCKET_URL ||
      new URL(API_BASE_URL).origin
    );
  } catch {
    return "http://localhost:5000";
  }
})();

// Mirrors backend constants/socketEvents.js — the single source of truth for
// event names. Never hardcode a socket event string elsewhere.
export const SOCKET_EVENTS = Object.freeze({
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  CONNECT_ERROR: "connect_error",
  RECONNECT_ATTEMPT: "reconnect_attempt",
  RECONNECT: "reconnect",
  RECONNECT_ERROR: "reconnect_error",
  RECONNECT_FAILED: "reconnect_failed",

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

  AUTH_ERROR: "auth:error",
  ROOM_JOIN: "room:join",
  ROOM_LEAVE: "room:leave",
  ROOM_ERROR: "room:error",
});

// Mirrors backend sockets/auth.js rejection codes. Connection attempts that
// fail with one of these stop auto-reconnecting (repeating them is a loop).
export const SOCKET_AUTH_ERROR_CODES = Object.freeze({
  MISSING_TOKEN: "MISSING_TOKEN",
  INVALID_TOKEN: "INVALID_TOKEN",
  EXPIRED_TOKEN: "EXPIRED_TOKEN",
  ACCOUNT_INACTIVE: "ACCOUNT_INACTIVE",
});

// Role-aware sidebar navigation. `roles: null` means every role sees the item;
// otherwise the item only appears for the listed roles (mirrors the backend's
// route gating in routes/shipmentRoutes.js). Only real, existing routes.
export const NAV_STRUCTURE = Object.freeze([
  {
    id: "overview",
    label: "Overview",
    items: [{ to: "/dashboard", label: "Dashboard", icon: FiGrid, roles: null }],
  },
  {
    id: "operations",
    label: "Operations",
    items: [
      { to: "/shipments", label: "Shipments", icon: FiTruck, roles: null },
      {
        to: "/shipments/create",
        label: "Create Shipment",
        icon: FiPlusCircle,
        roles: CAN_CREATE_SHIPMENT_ROLES,
      },
    ],
  },
  {
    id: "communications",
    label: "Communications",
    items: [
      { to: "/notifications", label: "Notifications", icon: FiBell, roles: null },
    ],
  },
]);
