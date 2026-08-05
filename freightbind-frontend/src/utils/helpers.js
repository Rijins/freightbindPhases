
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
    // Hub Operators may only ever update currentLocation.
    return true;
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
    return allFields.filter((f) => f !== "assignedDispatcher");
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
 
/** Backend services/timelineService.js: assertCanUpdateLocation mirrored for UI hints only. */
export const canUpdateShipmentLocation = (user, shipment) => {
  if (!user || !shipment) return false;
  if ([ROLES.ADMIN, ROLES.LOGISTICS_DIRECTOR].includes(user.role)) return true;
  if (user.role === ROLES.CARRIER_DISPATCHER) return isAssignedDispatcher(user, shipment);
  if (user.role === ROLES.HUB_OPERATOR) return true;
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
  if (user.role === ROLES.HUB_OPERATOR) return true;
  return false;
};

/** NAV_STRUCTURE filtered down to the groups and items the role may navigate to. */
export const getRoleNavGroups = (role) =>
  NAV_STRUCTURE.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.roles || item.roles.includes(role)),
  })).filter((group) => group.items.length > 0);
 
