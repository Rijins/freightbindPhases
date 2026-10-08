// Mirrors backend constants exactly (constants/roles.js, models/Shipment.js).
// Never invent values here that the backend does not already define.

import {
  FiBell,
  FiGrid,
  FiHome,
  FiMapPin,
  FiPlusCircle,
  FiSettings,
  FiTruck,
  FiUser,
  FiUsers,
  FiVolume2,
} from "react-icons/fi";

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

// Only Admin can manage users (routes/userRoutes.js — every /api/users route
// is gated with authorize(ROLES.ADMIN)).
export const CAN_MANAGE_USERS_ROLES = [ROLES.ADMIN];

// Only Admin manages hubs (routes/hubRoutes.js — every /api/hubs management
// route is gated with authorize(ROLES.ADMIN)).
export const CAN_MANAGE_HUBS_ROLES = [ROLES.ADMIN];

// Only Admin manages system announcements (routes/announcementRoutes.js —
// every management route is gated with authorize(ROLES.ADMIN)).
export const CAN_MANAGE_ANNOUNCEMENTS_ROLES = [ROLES.ADMIN];

// Announcement statuses (models/Announcement.js). "expired" is computed from
// the end date at read time — never stored.
export const ANNOUNCEMENT_STATUSES = ["active", "inactive"];

// Announcement priority reuses the notification priority enum (the shared
// constants/notificationTypes.js source) — never a second priority system.
export const ANNOUNCEMENT_PRIORITIES = ["Low", "Medium", "High", "Critical"];

// Hub types and statuses (models/Hub.js) — mirrors the backend enum exactly.
export const HUB_TYPES = ["Port", "Yard", "Warehouse", "Distribution"];

export const HUB_STATUSES = ["active", "inactive"];

// User account statuses (models/User.js). "suspended" exists in the schema
// but is not offered in the admin UI's primary toggle.
export const USER_STATUSES = ["active", "inactive", "suspended"];

// Concise role explanations shown in the user form's role selector.
export const ROLE_DESCRIPTIONS = Object.freeze({
  [ROLES.ADMIN]: "Full system administration and user management.",
  [ROLES.LOGISTICS_DIRECTOR]: "Operational oversight and shipment management.",
  [ROLES.CARRIER_DISPATCHER]: "Carrier-side shipment assignment and operational coordination.",
  [ROLES.HUB_OPERATOR]: "Hub-side shipment/location operations.",
});

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
  CHAT_MESSAGE: "chat:message",

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
      {
        to: "/hub-operations",
        label: "Hub Operations",
        icon: FiHome,
        roles: [ROLES.HUB_OPERATOR],
      },
    ],
  },
  {
    id: "communications",
    label: "Communications",
    items: [
      { to: "/notifications", label: "Notifications", icon: FiBell, roles: null },
      { to: "/announcements", label: "Announcements", icon: FiVolume2, roles: null },
    ],
  },
  {
    id: "administration",
    label: "Administration",
    items: [
      { to: "/users", label: "User Management", icon: FiUsers, roles: CAN_MANAGE_USERS_ROLES },
      { to: "/hubs", label: "Hubs", icon: FiMapPin, roles: CAN_MANAGE_HUBS_ROLES },
    ],
  },
  {
    id: "account",
    label: "Account",
    items: [
      { to: "/profile", label: "Profile", icon: FiUser, roles: null },
      { to: "/settings", label: "Settings", icon: FiSettings, roles: null },
    ],
  },
]);

// AI infrastructure (Phase 8) — local defaults for the AI client. The
// backend endpoints for these features land in a later phase.
export const AI_RUN_ENDPOINT = "/ai/run";
export const AI_DEFAULT_TIMEOUT_MS = 60000;
export const AI_CACHE_TTL_MS = 300000;
export const AI_CACHE_MAX_ENTRIES = 100;
export const AI_MAX_RETRIES = 1;
