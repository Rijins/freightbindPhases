const NOTIFICATION_TYPES = Object.freeze({
    SHIPMENT_CREATED: "Shipment Created",
    SHIPMENT_UPDATED: "Shipment Updated",
    SHIPMENT_ASSIGNED: "Shipment Assigned",
    SHIPMENT_CANCELLED: "Shipment Cancelled",
    SHIPMENT_DELAYED: "Shipment Delayed",
    SHIPMENT_DELIVERED: "Shipment Delivered",
    TIMELINE_EVENT: "Timeline Event",
    SYSTEM_ANNOUNCEMENT: "System Announcement",
    WARNING: "Warning",
    SUCCESS: "Success",
    ERROR: "Error",
    AI_ALERT: "AI Alert",
    GENERAL: "General",
    SHIPMENT_APPROACHING_HUB: "Shipment Approaching Hub",
    SHIPMENT_ARRIVED_AT_HUB: "Shipment Arrived at Hub",
    HUB_HANDOFF_REQUIRED: "Hub Handoff Required",
    HUB_HANDOFF_COMPLETED: "Hub Handoff Completed",
    HUB_OPERATIONAL_ISSUE: "Hub Operational Issue",
    CHAT_MESSAGE: "Chat Message",
});
const NOTIFICATION_TYPES_LIST = Object.values(NOTIFICATION_TYPES);

// Notification types that are considered "shipment lifecycle" events.
// Used by the service layer to decide what a Logistics Director is allowed
// to create manually (see STEP 6 permission rules).
const SHIPMENT_NOTIFICATION_TYPES = [
    NOTIFICATION_TYPES.SHIPMENT_CREATED,
    NOTIFICATION_TYPES.SHIPMENT_UPDATED,
    NOTIFICATION_TYPES.SHIPMENT_ASSIGNED,
    NOTIFICATION_TYPES.SHIPMENT_CANCELLED,
    NOTIFICATION_TYPES.SHIPMENT_DELAYED,
    NOTIFICATION_TYPES.SHIPMENT_DELIVERED,
];

const NOTIFICATION_PRIORITIES = Object.freeze({
    LOW: "Low",
    MEDIUM: "Medium",
    HIGH: "High",
    CRITICAL: "Critical",
});
const NOTIFICATION_PRIORITIES_LIST = Object.values(NOTIFICATION_PRIORITIES);

const DELIVERY_STATUSES = Object.freeze({
    PENDING: "Pending",
    DELIVERED: "Delivered",
    FAILED: "Failed",
    READ: "Read",
});
const DELIVERY_STATUSES_LIST = Object.values(DELIVERY_STATUSES);

module.exports = {
    NOTIFICATION_TYPES,
    NOTIFICATION_TYPES_LIST,
    SHIPMENT_NOTIFICATION_TYPES,
    NOTIFICATION_PRIORITIES,
    NOTIFICATION_PRIORITIES_LIST,
    DELIVERY_STATUSES,
    DELIVERY_STATUSES_LIST,
};
