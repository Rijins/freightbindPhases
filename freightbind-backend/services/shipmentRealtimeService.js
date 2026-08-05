// Shipment realtime service — the ONLY place shipment/timeline socket events
// are emitted from. Controllers must never emit; services call the helpers
// below AFTER the underlying database operation has succeeded.
//
// Targeting model (Phase 7 Part 4):
//   - Shipment room (shipment:<id>) gets the dedicated event for the change
//     (shipment:status-changed / shipment:assigned / shipment:updated) plus
//     timeline:updated, so users viewing that shipment see it instantly.
//   - Role rooms (role:<role> for every role) get one generic
//     shipment:updated per change so shipment lists / dashboards can sync.
//     This is not a leak: GET /shipments is available to every authenticated
//     role, and each socket belongs to exactly one role room (no duplicates).
//
// Every emit is best-effort: it is wrapped so a socket or database failure
// can never crash the server or fail the business operation that triggered it.

const Shipment = require("../models/Shipment");
const ShipmentTimeline = require("../models/ShipmentTimeline");
const { ROLES_LIST } = require("../constants/roles");
const { SOCKET_EVENTS } = require("../constants/socketEvents");
const socketService = require("./socketService");

const USER_POPULATE_FIELDS = "fullName email role";

const fetchPopulatedShipment = async (shipmentId) =>
    Shipment.findById(shipmentId)
        .populate("createdBy", USER_POPULATE_FIELDS)
        .populate("assignedDispatcher", USER_POPULATE_FIELDS);

const fetchPopulatedTimelineEvent = async (eventId) =>
    ShipmentTimeline.findById(eventId).populate("performedBy", USER_POPULATE_FIELDS);

const safe = async (label, callback) => {
    try {
        return await callback();
    } catch (error) {
        console.error(`[shipment-realtime] ${label} failed: ${error.message}`);
        return null;
    }
};

// Emits the generic role-level shipment:updated to every role room. Safe to
// call for any change: list consumers only update rows they already hold.
const emitToRoles = (eventName, payload) => {
    return safe("role emit", () => socketService.emitToRoles(ROLES_LIST, eventName, payload));
};

// After a shipment is created: role rooms learn about it immediately. There
// is no shipment room membership yet, so no shipment-room emit is needed.
const emitShipmentCreated = async (shipment) => {
    if (!shipment || !shipment._id) return;

    const populated = await safe("fetch populated shipment", () =>
        fetchPopulatedShipment(shipment._id)
    );
    if (!populated) return;

    await emitToRoles(SOCKET_EVENTS.SHIPMENT_UPDATED, { shipment: populated });
};

// Emits after any shipment mutation (fields, status, dispatcher).
// Classification:
//   - status changed        -> shipment room shipment:status-changed
//   - dispatcher changed    -> shipment room shipment:assigned
//   - anything else         -> shipment room shipment:updated
// Always followed by the generic role-level shipment:updated so lists/dashboards
// sync. The payload always carries the FULL populated shipment document, so
// whichever event arrives, the frontend can reconcile its whole record.
const emitShipmentChanged = async ({ shipment, previousStatus, previousDispatcher }) => {
    if (!shipment || !shipment._id) return;

    const populated = await safe("fetch populated shipment", () =>
        fetchPopulatedShipment(shipment._id)
    );
    if (!populated) return;

    const shipmentId = populated._id;
    const statusChanged = previousStatus && previousStatus !== populated.status;

    const newDispatcher = populated.assignedDispatcher?._id ?? populated.assignedDispatcher;
    const previousDispatcherId = previousDispatcher
        ? String(previousDispatcher._id ?? previousDispatcher)
        : null;
    const newDispatcherId = newDispatcher ? String(newDispatcher) : null;
    const dispatcherChanged = previousDispatcherId !== newDispatcherId;

    await safe("shipment room emit", () => {
        if (statusChanged) {
            socketService.emitToShipment(shipmentId, SOCKET_EVENTS.SHIPMENT_STATUS_CHANGED, {
                shipmentId,
                shipment: populated,
                previousStatus,
            });
        } else if (dispatcherChanged) {
            socketService.emitToShipment(shipmentId, SOCKET_EVENTS.SHIPMENT_ASSIGNED, {
                shipmentId,
                shipment: populated,
                previousDispatcher,
            });
        } else {
            socketService.emitToShipment(shipmentId, SOCKET_EVENTS.SHIPMENT_UPDATED, {
                shipmentId,
                shipment: populated,
            });
        }
    });

    await emitToRoles(SOCKET_EVENTS.SHIPMENT_UPDATED, { shipment: populated });
};

// Emits a newly created timeline entry to the shipment room so live timelines
// append instantly. The event is re-fetched populated so the client renders
// the same shape as GET /timeline.
const emitTimelineUpdated = async (shipmentId, event) => {
    if (!shipmentId || !event || !event._id) return;

    const populated = await safe("fetch populated timeline event", () =>
        fetchPopulatedTimelineEvent(event._id)
    );
    if (!populated) return;

    await safe("timeline room emit", () =>
        socketService.emitToShipment(shipmentId, SOCKET_EVENTS.TIMELINE_UPDATED, {
            shipmentId,
            event: populated,
        })
    );
};

module.exports = {
    emitShipmentCreated,
    emitShipmentChanged,
    emitTimelineUpdated,
};
