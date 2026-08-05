const Shipment = require("../models/Shipment");
const User = require("../models/User");
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

    const shipmentData = getAllowedUpdateFields(payload);
    shipmentData.createdBy = user._id;
    shipmentData.status = "Draft";
    shipmentData.currentLocation = shipmentData.currentLocation || shipmentData.origin;
    validateDateOrder(shipmentData);

    const shipment = await Shipment.create(shipmentData);

    try {
        console.log("Creating notification...");
        await notificationService.notifyShipmentCreated(shipment, user);
        console.log("Notification created successfully.");
    } catch (err) {
        console.error("Notification dispatch failed:");
        console.error(err);
    }

    await shipmentRealtimeService.emitShipmentCreated(shipment);

    return shipment;
};

const getShipments = async (filters) => {
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

const getShipmentById = async (shipmentId) => {
    const shipment = await Shipment.findById(shipmentId)
        .populate("createdBy", "fullName email role")
        .populate("assignedDispatcher", "fullName email role");

    if (!shipment) {
        throw createError("Shipment not found", 404);
    }

    return shipment;
};

const authorizeUpdate = (shipment, updates, user) => {
    if (user.role === ROLES.HUB_OPERATOR) {
        if (Object.keys(updates).length !== 1 || updates.currentLocation === undefined) {
            throw createError("Hub Operators can update shipment location only", 403);
        }
        return;
    }

    if (user.role === ROLES.CARRIER_DISPATCHER) {
        if (!shipment.assignedDispatcher || !shipment.assignedDispatcher.equals(user._id)) {
            throw createError("Carrier Dispatchers can update assigned shipments only", 403);
        }
        if (updates.assignedDispatcher !== undefined) {
            throw createError("Carrier Dispatchers cannot reassign shipments", 403);
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

    const updatedValues = { ...shipment.toObject(), ...updates };
    validateDateOrder(updatedValues);

    const previousStatus = shipment.status;
    const previousDispatcher = shipment.assignedDispatcher;

    shipment.set(updates);

    const savedShipment = await shipment.save();

    await dispatchShipmentUpdateNotification(
        savedShipment,
        updates,
        previousStatus,
        previousDispatcher,
        user
    );

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
};
