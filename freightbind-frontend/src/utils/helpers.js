
import { NAV_STRUCTURE, ROLES } from "./constants";
 
/**
 * Formats an ISO date string for display. Returns a dash when empty,
 * since many shipment date fields are nullable until set.
 */
export const formatDate = (value, options = {}) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  });
};
 
export const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/** Formats an ISO date string as a short time (used for chat message bubbles). */
export const formatTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
};
 
/** Converts a Date (or ISO string) into the yyyy-MM-ddThh:mm shape <input type="datetime-local"> needs. */
export const toDateTimeInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
};
 
export const formatWeight = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  return `${value} kg`;
};
 
/**
 * Reads a normalized error message + field errors out of an Axios error,
 * matching the backend's { success, message, errors } response shape.
 */
export const parseApiError = (error) => {
  if (error?.response?.data) {
    const { message, errors } = error.response.data;
    return {
      status: error.response.status,
      message: message || "Something went wrong. Please try again.",
      errors: Array.isArray(errors) ? errors : [],
    };
  }
  if (error?.request) {
    return {
      status: null,
      message: "Unable to reach the server. Check your connection and try again.",
      errors: [],
    };
  }
  return {
    status: null,
    message: error?.message || "Something went wrong. Please try again.",
    errors: [],
  };
};
 
export const getInitials = (fullName = "") =>
  fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";
 
/** Mirrors services/shipmentService.js authorizeUpdate() so the UI never offers
 * an action the backend would reject. Backend remains the final authority. */
export const canCreateShipment = (role) =>
  [ROLES.ADMIN, ROLES.LOGISTICS_DIRECTOR].includes(role);
 
export const canDeleteShipment = (role) =>
  [ROLES.ADMIN, ROLES.LOGISTICS_DIRECTOR].includes(role);

/** Mirrors routes/userRoutes.js: only Admin may manage users. */
export const canManageUsers = (role) => role === ROLES.ADMIN;

/** Mirrors routes/announcementRoutes.js: only Admin may manage announcements. */
export const canManageAnnouncements = (role) => role === ROLES.ADMIN;

/** Mirrors routes/hubRoutes.js: only Admin may manage hubs. */
export const canManageHubs = (role) => role === ROLES.ADMIN;

/**
 * Mirrors services/chatService.js assertChatAccess() so the UI only ever
 * offers chat on shipments the backend will accept. Backend remains the
 * final authority (403 if this mirror drifts).
 */
export const canChatOnShipment = (user, shipment) => {
  if (!user || !shipment) return false;

  if (user.role === ROLES.CARRIER_DISPATCHER) {
    const dispatcherId =
      typeof shipment?.assignedDispatcher === "object"
        ? shipment.assignedDispatcher?._id
        : shipment?.assignedDispatcher;
    return Boolean(dispatcherId) && (dispatcherId === user._id || dispatcherId === user.id);
  }

  if (user.role === ROLES.HUB_OPERATOR) {
    const userHub = user.hub || user.hubId;
    const shipmentHub =
      typeof shipment?.hub === "object" ? shipment.hub?._id : shipment?.hub;
    return Boolean(userHub) && Boolean(shipmentHub) && String(userHub) === String(shipmentHub);
  }

  return false;
};

/** UI badge tones for hub statuses (models/Hub.js). */
export const HUB_STATUS_BADGE_TONES = {
  active: "emerald",
  inactive: "slate",
};

/** UI badge tones for user account statuses (models/User.js). */
export const USER_STATUS_BADGE_TONES = {
  active: "emerald",
  inactive: "slate",
  suspended: "amber",
};

/**
 * Effective announcement status for display. "expired" is derived from the
 * end date at read time — the backend never stores it and never exposes an
 * expired announcement as active.
 */
export const getAnnouncementDisplayStatus = (announcement, now = Date.now()) => {
  if (announcement?.endDate && new Date(announcement.endDate).getTime() < now) {
    return "expired";
  }
  return announcement?.status || "inactive";
};

/** UI badge tones for announcement statuses (active/inactive/derived expired). */
export const ANNOUNCEMENT_STATUS_BADGE_TONES = {
  active: "emerald",
  inactive: "slate",
  expired: "amber",
};
 
export const canEditShipment = (user, shipment) => {
  if (!user || !shipment) return false;
  if (shipment.status === "Cancelled") return false;
  
  if ([ROLES.ADMIN, ROLES.LOGISTICS_DIRECTOR].includes(user.role)) return true;
  
  if (user.role === ROLES.CARRIER_DISPATCHER) {
    const dispatcherId =
      typeof shipment.assignedDispatcher === "object"
        ? shipment.assignedDispatcher?._id
        : shipment.assignedDispatcher;
    return dispatcherId === user._id || dispatcherId === user.id;
  }
  
  if (user.role === ROLES.HUB_OPERATOR) {
    // Hub Operators may only ever update currentLocation (see getEditableFields).
    return isHubRelevant(user, shipment);
  }
  
  return false;
};
 
/** Returns which shipment fields the current role/user may edit for this shipment. */
export const getEditableFields = (user, shipment) => {
  const allFields = [
    "title",
    "description",
    "cargoType",
    "shipmentType",
    "origin",
    "destination",
    "currentLocation",
    "priority",
    "status",
    "assignedDispatcher",
    "hub",
    "estimatedDeparture",
    "estimatedArrival",
    "actualDeparture",
    "actualArrival",
    "weight",
    "containerNumber",
    "vehicleNumber",
    "notes",
  ];
 
  if (!user) return [];
  if ([ROLES.ADMIN, ROLES.LOGISTICS_DIRECTOR].includes(user.role)) return allFields;
  if (user.role === ROLES.CARRIER_DISPATCHER) {
    return allFields.filter((f) => f !== "assignedDispatcher" && f !== "hub");
  }
  if (user.role === ROLES.HUB_OPERATOR) {
    return ["currentLocation"];
  }
  return [];
};
 
/** Backend STATUS_TRANSITIONS (services/shipmentService.js) mirrored for UI hints only. */
export const STATUS_TRANSITIONS = {
  Draft: ["Created", "Cancelled"],
  Created: ["Scheduled", "Cancelled"],
  Scheduled: ["In Transit", "Delayed", "Cancelled"],
  "In Transit": ["Delayed", "Delivered", "Cancelled"],
  Delayed: ["In Transit", "Delivered", "Cancelled"],
  Delivered: [],
  Cancelled: [],
};
 
export const getAllowedNextStatuses = (currentStatus) =>
  STATUS_TRANSITIONS[currentStatus] || [];

/** UI badge tones for shipment statuses, shared by dashboard widgets. */
export const SHIPMENT_STATUS_BADGE_TONES = {
  Delivered: "emerald",
  "In Transit": "blue",
  Delayed: "amber",
  Cancelled: "red",
  Scheduled: "indigo",
};
 
export const buildQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, value);
    }
  });
  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
};
 
/** Is `user` the Carrier Dispatcher assigned to `shipment`? Shared by every timeline permission check below. */
const isAssignedDispatcher = (user, shipment) => {
  const dispatcherId =
    typeof shipment?.assignedDispatcher === "object"
      ? shipment.assignedDispatcher?._id
      : shipment?.assignedDispatcher;
  return Boolean(dispatcherId) && (dispatcherId === user?._id || dispatcherId === user?.id);
};
 
/** Backend services/timelineService.js: assertCanUpdateStatus mirrored for UI hints only. */
export const canUpdateShipmentStatus = (user, shipment) => {
  if (!user || !shipment) return false;
  if ([ROLES.ADMIN, ROLES.LOGISTICS_DIRECTOR].includes(user.role)) return true;
  if (user.role === ROLES.CARRIER_DISPATCHER) return isAssignedDispatcher(user, shipment);
  return false;
};
 
/** Is the Hub Operator truly scoped to the shipment's own hub (mirrors backend assertHubRelevant)? */
const isHubRelevant = (user, shipment) => {
  const userHub = user?.hub || user?.hubId;
  const shipmentHub =
    typeof shipment?.hub === "object" ? shipment.hub?._id : shipment?.hub;
  return Boolean(userHub) && Boolean(shipmentHub) && String(userHub) === String(shipmentHub);
};

/** Backend services/timelineService.js: assertCanUpdateLocation mirrored for UI hints only. */
export const canUpdateShipmentLocation = (user, shipment) => {
  if (!user || !shipment) return false;
  if ([ROLES.ADMIN, ROLES.LOGISTICS_DIRECTOR].includes(user.role)) return true;
  if (user.role === ROLES.CARRIER_DISPATCHER) return isAssignedDispatcher(user, shipment);
  if (user.role === ROLES.HUB_OPERATOR) return isHubRelevant(user, shipment);
  return false;
};
 
/** Backend services/timelineService.js: assertCanAssignDispatcher mirrored for UI hints only. */
export const canAssignDispatcher = (user) =>
  Boolean(user) && [ROLES.ADMIN, ROLES.LOGISTICS_DIRECTOR].includes(user.role);
 
/** Backend services/timelineService.js: assertCanAddNote mirrored for UI hints only. */
export const canAddTimelineNote = (user, shipment) => {
  if (!user || !shipment) return false;
  if ([ROLES.ADMIN, ROLES.LOGISTICS_DIRECTOR].includes(user.role)) return true;
  if (user.role === ROLES.CARRIER_DISPATCHER) return isAssignedDispatcher(user, shipment);
  if (user.role === ROLES.HUB_OPERATOR) return isHubRelevant(user, shipment);
  return false;
};

/** NAV_STRUCTURE filtered down to the groups and items the role may navigate to. */
export const getRoleNavGroups = (role) =>
  NAV_STRUCTURE.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.roles || item.roles.includes(role)),
  })).filter((group) => group.items.length > 0);
 
