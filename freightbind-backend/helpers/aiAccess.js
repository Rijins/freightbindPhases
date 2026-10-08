const { ROLES } = require("../constants/roles");

const createError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

/**
 * View-scoping for AI information (Phase 9 Part 4). Backend is the source
 * of truth: a Carrier Dispatcher may only receive AI information for
 * shipments assigned to them, and a Hub Operator only for shipments
 * relevant to their own hub (mirroring services/shipmentService.js
 * getShipmentById). Only Admin and Logistics Director may view any
 * shipment, matching the existing read model.
 */
const resolveEntityId = (value) =>
    value && typeof value === "object" ? value._id : value;

const assertCanViewShipment = (shipment, user) => {
    if (!user) return;

    if (user.role === ROLES.CARRIER_DISPATCHER) {
        const dispatcherIdString = String(resolveEntityId(shipment.assignedDispatcher));
        const userIdString = String(user._id);
        if (!dispatcherIdString || dispatcherIdString !== userIdString) {
            throw createError(
                "Carrier Dispatchers can only access AI information for assigned shipments",
                403
            );
        }
        return;
    }

    if (user.role === ROLES.HUB_OPERATOR) {
        const hubIdString = String(resolveEntityId(shipment.hub));
        const userHubString = user.hub ? String(user.hub) : null;
        if (!userHubString || !hubIdString || userHubString !== hubIdString) {
            throw createError(
                "Hub Operators can only access AI information for shipments relevant to their hub",
                403
            );
        }
        return;
    }

    if (user.role !== ROLES.ADMIN && user.role !== ROLES.LOGISTICS_DIRECTOR) {
        throw createError("Forbidden: insufficient role permissions", 403);
    }
};

module.exports = { assertCanViewShipment };
