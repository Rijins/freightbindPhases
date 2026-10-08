const Shipment = require("../models/Shipment");
const User = require("../models/User");
const Hub = require("../models/Hub");
const { ROLES } = require("../constants/roles");
const notificationService = require("./notificationService");
const shipmentRealtimeService = require("./shipmentRealtimeService");


const MUTABLE_FIELDS = [
    "title",
    "description",
    "cargoType",
    "shipmentType",
    "origin",
    "destination",
    "priority",
    "estimatedDeparture",
    "estimatedArrival",
    "actualDeparture",
    "actualArrival",
    "weight",
    "containerNumber",
    "vehicleNumber",
    "notes",
    "assignedDispatcher",
    "hub",
];

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

const getAllowedUpdateFields = (updates) =>
    Object.fromEntries(
        Object.entries(updates).filter(([field, value]) => MUTABLE_FIELDS.includes(field) && value !== undefined)
    );

const verifyDispatcher = async (dispatcherId) => {
    if (!dispatcherId) return;

    const dispatcher = await User.findById(dispatcherId).select("role status");
    if (
        !dispatcher ||
        dispatcher.role !== ROLES.CARRIER_DISPATCHER ||
        dispatcher.status !== "active"
    ) {
        throw createError("Assigned dispatcher must be an active Carrier Dispatcher user", 422);
    }
};

// A shipment's operational hub must exist and be active. Only Admin and
// Logistics Director can set it (they are the only shipment editors with
// hub access), so no role check is needed here.
const verifyHub = async (hubId) => {
    if (!hubId) return;
    const hub = await Hub.findById(hubId);
    if (!hub) {
        throw createError("Hub not found", 404);
    }
    if (hub.status !== "active") {
        throw createError("Cannot assign a shipment to an inactive hub", 422);
    }
};

const validateDateOrder = (shipment) => {
    if (
        shipment.estimatedDeparture &&
        shipment.estimatedArrival &&
        shipment.estimatedArrival < shipment.estimatedDeparture
    ) {
        throw createError("Estimated arrival cannot be before estimated departure", 422);
    }

    if (shipment.actualDeparture && shipment.actualArrival && shipment.actualArrival < shipment.actualDeparture) {
        throw createError("Actual arrival cannot be before actual departure", 422);
    }
};

const validateStatusTransition = (currentStatus, nextStatus) => {
    if (!nextStatus || currentStatus === nextStatus) return;

    if (!STATUS_TRANSITIONS[currentStatus]?.includes(nextStatus)) {
        throw createError(`Invalid shipment status transition from ${currentStatus} to ${nextStatus}`, 422);
    }
};

const createShipment = async (payload, user) => {
    if (payload.status && payload.status !== "Draft") {
        throw createError("New shipments must be created with Draft status", 422);
    }

    await verifyDispatcher(payload.assignedDispatcher);
    await verifyHub(payload.hub);

    const shipmentData = getAllowedUpdateFields(payload);
    shipmentData.createdBy = user._id;
    shipmentData.status = "Draft";
    shipmentData.currentLocation = shipmentData.currentLocation || shipmentData.origin;
    validateDateOrder(shipmentData);

    const shipment = await Shipment.create(shipmentData);

    try {
        console.log("Creating notification...");
        await notificationService.notifyShipmentCreated(shipment, user);
        // A dispatcher picked at creation time must receive the same
        // "Shipment Assigned" notification the update/timeline flows send.
        // notifyShipmentCreated covers the "Shipment Created" notice; this
        // emits the personal assignment notice — recipient is the assigned
        // dispatcher only, never the whole role.
        if (shipment.assignedDispatcher) {
            await notificationService.notifyShipmentAssigned(shipment, user);
        }
        // Hub operators are only notified when the shipment is actually
        // relevant to THEIR hub — never on every shipment creation.
        if (shipment.hub) {
            await notificationService.notifyHubShipmentRelevant(shipment, user);
        }
        console.log("Notification created successfully.");
    } catch (err) {
        console.error("Notification dispatch failed:");
        console.error(err);
    }

    await shipmentRealtimeService.emitShipmentCreated(shipment);

    return shipment;
};

// Hub Operators only ever see shipments relevant to their own hub. A Hub
// Operator without a hub sees an empty list (their workspace shows a setup
// state instead of unrelated shipments). Every other role keeps the full
// shipment list and may additionally filter by hub via query params.
const applyHubVisibility = async (query, user) => {
    if (!user || user.role !== ROLES.HUB_OPERATOR) return;
    query.hub = user.hub || null;
    if (query.hub === null) {
        query._id = { $in: [] };
    }
};

const getShipments = async (filters, user) => {
    const {
        search,
        status,
        priority,
        cargoType,
        shipmentType,
        origin,
        destination,
        createdBy,
        assignedDispatcher,
        hub,
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        order = "desc",
    } = filters;

    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (cargoType) query.cargoType = cargoType;
    if (shipmentType) query.shipmentType = shipmentType;
    if (origin) query.origin = origin;
    if (destination) query.destination = destination;
    if (createdBy) query.createdBy = createdBy;
    if (assignedDispatcher) query.assignedDispatcher = assignedDispatcher;
    if (hub) query.hub = hub;

    await applyHubVisibility(query, user);

    if (search) {
        const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const searchExpression = new RegExp(escapedSearch, "i");
        query.$or = [
            { shipmentId: searchExpression },
            { title: searchExpression },
            { origin: searchExpression },
            { destination: searchExpression },
            { containerNumber: searchExpression },
            { vehicleNumber: searchExpression },
        ];
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: order === "asc" ? 1 : -1 };
    const [shipments, totalItems] = await Promise.all([
        Shipment.find(query)
            .populate("createdBy", "fullName email role")
            .populate("assignedDispatcher", "fullName email role")
            .populate("hub", "name location type status")
            .sort(sort)
            .skip(skip)
            .limit(limit),
        Shipment.countDocuments(query),
    ]);

    return {
        shipments,
        pagination: {
            totalItems,
            currentPage: page,
            totalPages: Math.ceil(totalItems / limit),
        },
    };
};

const getShipmentById = async (shipmentId, user) => {
    const shipment = await Shipment.findById(shipmentId)
        .populate("createdBy", "fullName email role")
        .populate("assignedDispatcher", "fullName email role")
        .populate("hub", "name location type status");

    if (!shipment) {
        throw createError("Shipment not found", 404);
    }

    // Hub Operators may only open shipments relevant to their hub.
    if (
        user &&
        user.role === ROLES.HUB_OPERATOR &&
        (!user.hub || !shipment.hub || !user.hub.equals(shipment.hub._id || shipment.hub))
    ) {
        throw createError("You can only view shipments relevant to your hub", 403);
    }

    return shipment;
};

const authorizeUpdate = (shipment, updates, user) => {
    if (user.role === ROLES.HUB_OPERATOR) {
        if (Object.keys(updates).length !== 1 || updates.currentLocation === undefined) {
            throw createError("Hub Operators can update shipment location only", 403);
        }
        if (!user.hub || !shipment.hub || String(user.hub) !== String(shipment.hub._id || shipment.hub)) {
            throw createError("You can only update shipments relevant to your hub", 403);
        }
        return;
    }

    if (user.role === ROLES.CARRIER_DISPATCHER) {
        if (!shipment.assignedDispatcher || !shipment.assignedDispatcher.equals(user._id)) {
            throw createError("Carrier Dispatchers can update assigned shipments only", 403);
        }
        if (updates.assignedDispatcher !== undefined || updates.hub !== undefined) {
            throw createError("Carrier Dispatchers cannot reassign shipments or change their hub", 403);
        }
        return;
    }

    if (![ROLES.ADMIN, ROLES.LOGISTICS_DIRECTOR].includes(user.role)) {
        throw createError("Forbidden: insufficient role permissions", 403);
    }
};
const dispatchShipmentUpdateNotification = async (
    shipment,
    updates,
    previousStatus,
    previousDispatcher,
    user
) => {
    try {
        if (updates.status === "Cancelled" && previousStatus !== "Cancelled") {
            return await notificationService.notifyShipmentCancelled(shipment, user);
        }

        if (updates.status === "Delivered" && previousStatus !== "Delivered") {
            return await notificationService.notifyShipmentDelivered(shipment, user);
        }

        if (updates.status === "Delayed" && previousStatus !== "Delayed") {
            return await notificationService.notifyShipmentDelayed(shipment, user);
        }

        if (
            updates.assignedDispatcher !== undefined &&
            (!previousDispatcher ||
                !previousDispatcher.equals(shipment.assignedDispatcher))
        ) {
            return await notificationService.notifyShipmentAssigned(shipment, user);
        }

        return await notificationService.notifyShipmentUpdated(shipment, user);
    } catch (err) {
        console.error("Notification dispatch failed:", err.message);
    }
};

const updateShipment = async (shipmentId, payload, user) => {
    const shipment = await Shipment.findById(shipmentId);
    if (!shipment) {
        throw createError("Shipment not found", 404);
    }
    if (shipment.status === "Cancelled") {
        throw createError("Cancelled shipments cannot be edited", 422);
    }

    const updates = getAllowedUpdateFields(payload);
    if (!Object.keys(updates).length) {
        throw createError("No valid shipment fields were provided for update", 422);
    }

    authorizeUpdate(shipment, updates, user);
    validateStatusTransition(shipment.status, updates.status);
    await verifyDispatcher(updates.assignedDispatcher);
    await verifyHub(updates.hub);

    const updatedValues = { ...shipment.toObject(), ...updates };
    validateDateOrder(updatedValues);

    const previousStatus = shipment.status;
    const previousDispatcher = shipment.assignedDispatcher;
    const previousHub = shipment.hub;

    shipment.set(updates);

    const savedShipment = await shipment.save();

    await dispatchShipmentUpdateNotification(
        savedShipment,
        updates,
        previousStatus,
        previousDispatcher,
        user
    );

    // When a shipment's operational hub is set (or changes), only that hub's
    // operators are notified — never all Hub Operators.
    if (savedShipment.hub && (!previousHub || !previousHub.equals(savedShipment.hub))) {
        try {
            await notificationService.notifyHubShipmentRelevant(savedShipment, user);
        } catch (err) {
            console.error("Hub notification dispatch failed:", err.message);
        }
    }

    await shipmentRealtimeService.emitShipmentChanged({
        shipment: savedShipment,
        previousStatus,
        previousDispatcher,
    });

    return savedShipment;
};

const deleteShipment = async (shipmentId) => {
    const shipment = await Shipment.findById(shipmentId);
    if (!shipment) {
        throw createError("Shipment not found", 404);
    }
    if (shipment.status === "Delivered") {
        throw createError("Delivered shipments cannot be deleted", 422);
    }

    await shipment.deleteOne();
};

module.exports = {
    createShipment,
    getShipments,
    getShipmentById,
    updateShipment,
    deleteShipment,
    authorizeUpdate,
};
