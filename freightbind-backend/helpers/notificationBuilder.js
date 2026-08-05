// Pure text templates only — no database access, no side effects.
// This is the single source of truth for notification wording so that
// no notification copy is ever hardcoded elsewhere in the project.
// The actual creation/dispatch logic (who receives it, permission checks,
// persistence) lives in services/notificationService.js.

const shipmentCreated = (shipment) => ({
    title: "Shipment Created",
    message: `Shipment ${shipment.shipmentId} has been created.`,
});

const shipmentUpdated = (shipment) => ({
    title: "Shipment Updated",
    message: `Shipment ${shipment.shipmentId} has been updated.`,
});

const shipmentAssigned = (shipment) => ({
    title: "Shipment Assigned",
    message: `Shipment ${shipment.shipmentId} has been assigned to you.`,
});

const shipmentCancelled = (shipment) => ({
    title: "Shipment Cancelled",
    message: `Shipment ${shipment.shipmentId} has been cancelled.`,
});

const shipmentDelayed = (shipment) => ({
    title: "Shipment Delayed",
    message: `Shipment ${shipment.shipmentId} has been delayed.`,
});

const shipmentDelivered = (shipment) => ({
    title: "Shipment Delivered",
    message: `Shipment ${shipment.shipmentId} has been delivered successfully.`,
});

// Called by timelineService.notifyTimelineEvent for status, location,
// dispatcher-assignment, and note events on a shipment's timeline.
const timelineEvent = (shipment, eventLabel) => ({
    title: "Timeline Event",
    message: `Shipment ${shipment.shipmentId}: ${eventLabel}.`,
});

const systemAnnouncement = (title, message) => ({ title, message });
const warning = (title, message) => ({ title, message });
const success = (title, message) => ({ title, message });
const error = (title, message) => ({ title, message });
const aiAlert = (title, message) => ({ title, message });

module.exports = {
    shipmentCreated,
    shipmentUpdated,
    shipmentAssigned,
    shipmentCancelled,
    shipmentDelayed,
    shipmentDelivered,
    timelineEvent,
    systemAnnouncement,
    warning,
    success,
    error,
    aiAlert,
};