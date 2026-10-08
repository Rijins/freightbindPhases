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

// Hub-operational notifications (Phase 9 Part 8). Only fired when a shipment
// is genuinely relevant to a hub — never broadcast to all Hub Operators.
const hubShipmentRelevant = (shipment, hub) => ({
    title: "Shipment Created",
    message: `Shipment ${shipment.shipmentId} is now relevant to ${hub ? hub.name : "your"} hub.`,
});

const hubShipmentArrived = (shipment, hub) => ({
    title: "Shipment Arrived at Hub",
    message: `Shipment ${shipment.shipmentId} has arrived at ${hub ? hub.name : "your"} hub.`,
});

// New shipment chat message (Phase 9): notifies the intended recipient that
// the operational conversation on a shipment has a new message from the
// sender. `sender` is the authenticated sender's user document (role label
// identifies the sender's side of the conversation).
const chatMessage = (shipment, sender) => ({
    title: "New Chat Message",
    message: `${sender.role} sent you a message on shipment ${shipment.shipmentId}.`,
});

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
    hubShipmentRelevant,
    hubShipmentArrived,
    chatMessage,
};