const ShipmentTimeline = require("../models/ShipmentTimeline");
const Shipment = require("../models/Shipment");
const User = require("../models/User");
const { ROLES } = require("../constants/roles");
const notificationService = require("./notificationService");
const shipmentRealtimeService = require("./shipmentRealtimeService");

// ------------------------------------------------------------
// Lifecycle Engine
// ------------------------------------------------------------
// Mirrors the shipment lifecycle enforced in Phase 02's shipmentService
// so that status changes are consistent no matter which route (legacy
// PUT /shipments/:id or the new POST /timeline/status) triggers them.
const STATUS_TRANSITIONS = {
  Draft: ["Created", "Cancelled"],
  Created: ["Scheduled", "Cancelled"],
  Scheduled: ["In Transit", "Delayed", "Cancelled"],
  "In Transit": ["Delayed", "Delivered", "Cancelled"],
  Delayed: ["In Transit", "Delivered", "Cancelled"],
  Delivered: [],
  Cancelled: [],
};

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const validateStatusTransition = (currentStatus, nextStatus) => {
  if (currentStatus === nextStatus) {
    throw createError(`Shipment is already in status: ${currentStatus}`, 400);
  }
  if (!STATUS_TRANSITIONS[currentStatus]?.includes(nextStatus)) {
    throw createError("Invalid status transition", 400);
  }
};

// ------------------------------------------------------------
// Permissions
// ------------------------------------------------------------
const assertCanUpdateStatus = (shipment, user) => {
  if ([ROLES.ADMIN, ROLES.LOGISTICS_DIRECTOR].includes(user.role)) return;

  if (user.role === ROLES.CARRIER_DISPATCHER) {
    if (!shipment.assignedDispatcher || !shipment.assignedDispatcher.equals(user._id)) {
      throw createError("Carrier Dispatchers can only update shipments assigned to them", 403);
    }
    return;
  }

  throw createError("Forbidden: insufficient role permissions to update shipment status", 403);
};

const assertCanUpdateLocation = (shipment, user) => {
  if ([ROLES.ADMIN, ROLES.LOGISTICS_DIRECTOR].includes(user.role)) return;

  if (user.role === ROLES.CARRIER_DISPATCHER) {
    if (!shipment.assignedDispatcher || !shipment.assignedDispatcher.equals(user._id)) {
      throw createError("Carrier Dispatchers can only update shipments assigned to them", 403);
    }
    return;
  }

  if (user.role === ROLES.HUB_OPERATOR) return;

  throw createError("Forbidden: insufficient role permissions to update shipment location", 403);
};

const assertCanAssignDispatcher = (user) => {
  if ([ROLES.ADMIN, ROLES.LOGISTICS_DIRECTOR].includes(user.role)) return;
  throw createError("Forbidden: only Admin or Logistics Director can assign dispatchers", 403);
};

const assertCanAddNote = (shipment, user) => {
  if ([ROLES.ADMIN, ROLES.LOGISTICS_DIRECTOR].includes(user.role)) return;

  if (user.role === ROLES.CARRIER_DISPATCHER) {
    if (!shipment.assignedDispatcher || !shipment.assignedDispatcher.equals(user._id)) {
      throw createError("Carrier Dispatchers can only add notes to shipments assigned to them", 403);
    }
    return;
  }

  if (user.role === ROLES.HUB_OPERATOR) return;

  throw createError("Forbidden: insufficient role permissions to add a note", 403);
};

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------
const getShipmentOr404 = async (shipmentId) => {
  const shipment = await Shipment.findById(shipmentId);
  if (!shipment) {
    throw createError("Shipment not found", 404);
  }
  return shipment;
};

const verifyDispatcher = async (dispatcherId) => {
  const dispatcher = await User.findById(dispatcherId).select("role status");
  if (!dispatcher || dispatcher.role !== ROLES.CARRIER_DISPATCHER || dispatcher.status !== "active") {
    throw createError("Assigned dispatcher must be an active Carrier Dispatcher user", 422);
  }
  return dispatcher;
};

// ------------------------------------------------------------
// Notification dispatch for timeline events
// ------------------------------------------------------------
// Mirrors the try/catch-and-log pattern used in shipmentService so a
// notification failure never blocks the timeline write itself.
const notifyTimelineEvent = async (shipment, eventLabel, event, actingUser) => {
  if (!shipment.assignedDispatcher) return;

  try {
    await notificationService.notifyTimelineUpdated(
      shipment,
      eventLabel,
      shipment.assignedDispatcher,
      actingUser,
      event._id
    );
  } catch (err) {
    console.error("Notification dispatch failed:", err.message);
  }
};

// ------------------------------------------------------------
// Create Timeline Event
// ------------------------------------------------------------
const createTimelineEvent = async ({
  shipment,
  eventType,
  description,
  statusBefore = null,
  statusAfter = null,
  location = null,
  performedBy,
  metadata = {},
}) => {
  const event = await ShipmentTimeline.create({
    shipment,
    eventType,
    description,
    statusBefore,
    statusAfter,
    location,
    performedBy,
    metadata,
  });

  // Single emit point for every timeline entry (status, location, dispatcher,
  // note, and the controller-created "Shipment Created" event) so live
  // timelines append instantly. Best-effort: never blocks or fails the write.
  await shipmentRealtimeService.emitTimelineUpdated(shipment, event);

  return event;
};

// ------------------------------------------------------------
// Get Timeline (complete, chronological)
// ------------------------------------------------------------
const getTimeline = async (shipmentId) => {
  await getShipmentOr404(shipmentId);

  const timeline = await ShipmentTimeline.find({ shipment: shipmentId })
    .populate("performedBy", "fullName email role")
    .sort({ createdAt: 1 });

  return timeline;
};

// ------------------------------------------------------------
// Get Latest Timeline Event
// ------------------------------------------------------------
const getLatestTimelineEvent = async (shipmentId) => {
  await getShipmentOr404(shipmentId);

  const latest = await ShipmentTimeline.findOne({ shipment: shipmentId })
    .populate("performedBy", "fullName email role")
    .sort({ createdAt: -1 });

  if (!latest) {
    throw createError("No timeline events found for this shipment", 404);
  }

  return latest;
};

// ------------------------------------------------------------
// Update Shipment Status
// ------------------------------------------------------------
const updateShipmentStatus = async (shipmentId, status, user, note) => {
  const shipment = await getShipmentOr404(shipmentId);

  assertCanUpdateStatus(shipment, user);
  validateStatusTransition(shipment.status, status);

  const statusBefore = shipment.status;
  shipment.status = status;
  await shipment.save();

  let eventType = "Status Updated";
  let description = `Status changed from ${statusBefore} to ${status}`;
  if (status === "Cancelled") {
    eventType = "Shipment Cancelled";
    description = `Shipment cancelled (previous status: ${statusBefore})`;
  } else if (status === "Delivered") {
    eventType = "Shipment Delivered";
    description = `Shipment delivered (previous status: ${statusBefore})`;
  }
  if (note) {
    description += ` — ${note}`;
  }

  const event = await createTimelineEvent({
    shipment: shipment._id,
    eventType,
    description,
    statusBefore,
    statusAfter: status,
    performedBy: user._id,
    metadata: note ? { note } : {},
  });

  await notifyTimelineEvent(shipment, description, event, user);

  await shipmentRealtimeService.emitShipmentChanged({
    shipment,
    previousStatus: statusBefore,
  });

  return { shipment, event };
};

// ------------------------------------------------------------
// Update Shipment Location
// ------------------------------------------------------------
const updateShipmentLocation = async (shipmentId, location, user) => {
  const shipment = await getShipmentOr404(shipmentId);

  assertCanUpdateLocation(shipment, user);

  const previousLocation = shipment.currentLocation;
  if (previousLocation === location) {
    throw createError(`Shipment is already at location: ${location}`, 400);
  }

  shipment.currentLocation = location;
  await shipment.save();

  const event = await createTimelineEvent({
    shipment: shipment._id,
    eventType: "Location Updated",
    description: `Location updated from "${previousLocation || "Unknown"}" to "${location}"`,
    location,
    performedBy: user._id,
    metadata: { previousLocation },
  });

  await notifyTimelineEvent(shipment, `Location updated to "${location}"`, event, user);

  await shipmentRealtimeService.emitShipmentChanged({ shipment });

  return { shipment, event };
};

// ------------------------------------------------------------
// Assign Dispatcher
// ------------------------------------------------------------
const assignDispatcher = async (shipmentId, dispatcherId, user) => {
  const shipment = await getShipmentOr404(shipmentId);

  assertCanAssignDispatcher(user);
  await verifyDispatcher(dispatcherId);

  const previousDispatcher = shipment.assignedDispatcher;
  if (previousDispatcher && previousDispatcher.equals(dispatcherId)) {
    throw createError("Shipment is already assigned to this dispatcher", 400);
  }

  const isReassignment = Boolean(previousDispatcher);
  shipment.assignedDispatcher = dispatcherId;
  await shipment.save();

  const event = await createTimelineEvent({
    shipment: shipment._id,
    eventType: isReassignment ? "Dispatcher Changed" : "Dispatcher Assigned",
    description: isReassignment
      ? "Dispatcher reassigned to a new Carrier Dispatcher"
      : "Dispatcher assigned to shipment",
    performedBy: user._id,
    metadata: {
      previousDispatcher: previousDispatcher || null,
      newDispatcher: dispatcherId,
    },
  });

  // At this point shipment.assignedDispatcher has already been updated to
  // dispatcherId (see above), so notifyTimelineEvent notifies the newly
  // assigned dispatcher, not the previous one.
  await notifyTimelineEvent(
    shipment,
    isReassignment ? "Dispatcher reassigned" : "Dispatcher assigned",
    event,
    user
  );

  await shipmentRealtimeService.emitShipmentChanged({
    shipment,
    previousDispatcher,
  });

  return { shipment, event };
};

// ------------------------------------------------------------
// Add Note
// ------------------------------------------------------------
const addNote = async (shipmentId, note, user) => {
  const shipment = await getShipmentOr404(shipmentId);

  assertCanAddNote(shipment, user);

  const event = await createTimelineEvent({
    shipment: shipment._id,
    eventType: "Note Added",
    description: note,
    performedBy: user._id,
  });

  await notifyTimelineEvent(shipment, "New note added", event, user);

  return { event };
};

module.exports = {
  STATUS_TRANSITIONS,
  createTimelineEvent,
  getTimeline,
  getLatestTimelineEvent,
  updateShipmentStatus,
  updateShipmentLocation,
  assignDispatcher,
  addNote,
};