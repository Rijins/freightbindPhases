const Notification = require("../models/Notification");
const User = require("../models/User");
const Shipment = require("../models/Shipment");
const { ROLES } = require("../constants/roles");
const {
    NOTIFICATION_TYPES,
    SHIPMENT_NOTIFICATION_TYPES,
    NOTIFICATION_PRIORITIES,
    DELIVERY_STATUSES,
} = require("../constants/notificationTypes");
const builder = require("../helpers/notificationBuilder");
const { buildNotificationPayload } = require("../helpers/notificationPayload");
const socketService = require("./socketService");
const { SOCKET_EVENTS } = require("../constants/socketEvents");

const createError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

// ------------------------------------------------------------------
// Realtime delivery helpers. Every notification event emitted by this
// service goes through socketService (never Socket.IO directly). Emits are
// best-effort: they are wrapped so a realtime failure can never crash the
// server or fail the business operation that triggered the notification.
// ------------------------------------------------------------------

// Authoritative unread count pushed to a user (keeps every tab in sync).
const emitCountUpdate = async (userId) => {
    try {
        const count = await Notification.countDocuments({ recipient: userId, isRead: false });
        socketService.emitToUser(userId, SOCKET_EVENTS.NOTIFICATION_COUNT, { count });
    } catch (error) {
        console.error(`[notification] count emit failed: ${error.message}`);
    }
};

// Marks a notification delivered over the socket when the recipient is
// online. Offline recipients keep `deliveryStatus = Pending` and pick the
// notification up from MongoDB on their next login/reconnect (no loss).
const markDelivered = async (notificationId, userId) => {
    if (!socketService.isUserOnline(userId)) return;
    await Notification.updateOne(
        { _id: notificationId },
        { $set: { deliveryStatus: DELIVERY_STATUSES.DELIVERED } }
    );
};

// Best-effort realtime delivery of a newly created notification. Never
// throws — persistence has already happened; a delivery failure only
// downgrades the deliveryStatus and reports the error back to the sender.
const deliverRealtime = async (notification, senderId) => {
    try {
        const userId = notification.recipient;

        const delivered = socketService.emitToUser(
            userId,
            SOCKET_EVENTS.NOTIFICATION,
            buildNotificationPayload(notification)
        );
        if (delivered) {
            await markDelivered(notification._id, userId);
        }

        if (socketService.isUserOnline(userId)) {
            await emitCountUpdate(userId);
        }
    } catch (error) {
        console.error(`[notification] realtime delivery failed: ${error.message}`);
        try {
            if (senderId) {
                socketService.emitToUser(senderId, SOCKET_EVENTS.NOTIFICATION_ERROR, {
                    message: "A notification could not be delivered in real time and may arrive late.",
                });
            }
        } catch (emitError) {
            console.error(`[notification] error notification emit failed: ${emitError.message}`);
        }
    }
};

const USER_POPULATE_FIELDS = "fullName email role";

// ------------------------------------------------------------------
// Internal, trusted creation path. This is the ONLY place a Notification
// document is ever created — both the public `createNotification` (API)
// and every automatic `notify*` helper below funnel through here so the
// validation rules never have to be duplicated.
// ------------------------------------------------------------------
const dispatchNotification = async ({
    title,
    message,
    type,
    priority = NOTIFICATION_PRIORITIES.MEDIUM,
    recipient,
    sender = null,
    relatedShipment = null,
    relatedTimeline = null,
}) => {
    if (!recipient) {
        throw createError("Notification recipient is required", 422);
    }

    const recipientUser = await User.findById(recipient).select("status");
    if (!recipientUser) {
        throw createError("Notification recipient does not exist", 404);
    }
    if (recipientUser.status !== "active") {
        throw createError("Cannot notify an inactive or suspended user", 422);
    }

    if (relatedShipment) {
        const shipmentExists = await Shipment.exists({ _id: relatedShipment });
        if (!shipmentExists) {
            throw createError("Related shipment does not exist", 404);
        }
    }

    // relatedTimeline is intentionally NOT existence-checked here: the
    // caller (timelineService.notifyTimelineEvent) always supplies the id
    // of a ShipmentTimeline document it just created in the same
    // request, so re-querying it would be redundant.

    const notification = await Notification.create({
        title,
        message,
        type,
        priority,
        recipient,
        sender,
        relatedShipment,
        relatedTimeline,
    });

    // Realtime delivery is best-effort and never throws. Persistence has
    // already succeeded, so a socket failure cannot lose the notification —
    // offline/missed notifications are pulled from MongoDB on login/reconnect.
    await deliverRealtime(notification, sender);

    return notification;
};

// ------------------------------------------------------------------
// Public/manual creation — used by POST /api/notifications.
// Enforces STEP 6 permission rules on who may author a notification by hand.
// ------------------------------------------------------------------
const createNotification = async (payload, actingUser) => {
    const { role } = actingUser;

    if (role === ROLES.HUB_OPERATOR || role === ROLES.CARRIER_DISPATCHER) {
        throw createError(`${role}s cannot create manual notifications`, 403);
    }

    if (role === ROLES.LOGISTICS_DIRECTOR && !SHIPMENT_NOTIFICATION_TYPES.includes(payload.type)) {
        throw createError(
            "Logistics Directors can only create shipment-related notifications",
            403
        );
    }

    // ROLES.ADMIN may create any type, including System Announcement.

    return dispatchNotification({ ...payload, sender: actingUser._id });
};

const buildDateRangeQuery = (dateFrom, dateTo) => {
    if (!dateFrom && !dateTo) return undefined;
    const range = {};
    if (dateFrom) range.$gte = dateFrom;
    if (dateTo) range.$lte = dateTo;
    return range;
};

// ------------------------------------------------------------------
// Combined list + search + filter + pagination, mirroring the pattern
// already used in shipmentService.getShipments. Kept as one function
// (rather than separate searchNotifications/filterNotifications) to
// avoid duplicating the same query-building logic twice.
// ------------------------------------------------------------------
const getNotifications = async (filters, actingUser) => {
    const {
        search,
        type,
        priority,
        read,
        recipient,
        deliveryStatus,
        dateFrom,
        dateTo,
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        order = "desc",
    } = filters;

    const query = {};

    // Non-admins can only ever see their own notifications, regardless of
    // what `recipient` filter they pass.
    if (actingUser.role === ROLES.ADMIN) {
        if (recipient) query.recipient = recipient;
    } else {
        query.recipient = actingUser._id;
    }

    if (type) query.type = type;
    if (priority) query.priority = priority;
    if (typeof read === "boolean") query.isRead = read;
    if (deliveryStatus) query.deliveryStatus = deliveryStatus;

    const dateRange = buildDateRangeQuery(dateFrom, dateTo);
    if (dateRange) query.createdAt = dateRange;

    if (search) {
        const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const searchExpression = new RegExp(escapedSearch, "i");

        const matchingShipmentIds = await Shipment.find({ shipmentId: searchExpression }).distinct("_id");

        query.$or = [
            { title: searchExpression },
            { message: searchExpression },
            { notificationId: searchExpression },
            ...(matchingShipmentIds.length ? [{ relatedShipment: { $in: matchingShipmentIds } }] : []),
        ];
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: order === "asc" ? 1 : -1 };

    const [notifications, totalItems] = await Promise.all([
        Notification.find(query)
            .populate("sender", USER_POPULATE_FIELDS)
            .populate("recipient", USER_POPULATE_FIELDS)
            .populate("relatedShipment", "shipmentId title status")
            .sort(sort)
            .skip(skip)
            .limit(limit),
        Notification.countDocuments(query),
    ]);

    return {
        notifications,
        pagination: {
            totalItems,
            currentPage: page,
            totalPages: Math.ceil(totalItems / limit),
        },
    };
};

const assertOwnershipOrAdmin = (notification, actingUser) => {
    if (actingUser.role === ROLES.ADMIN) return;
    if (!notification.recipient.equals(actingUser._id)) {
        throw createError("You do not have access to this notification", 403);
    }
};

const getNotification = async (notificationId, actingUser) => {
    const notification = await Notification.findById(notificationId)
        .populate("sender", USER_POPULATE_FIELDS)
        .populate("recipient", USER_POPULATE_FIELDS)
        .populate("relatedShipment", "shipmentId title status");

    if (!notification) {
        throw createError("Notification not found", 404);
    }

    assertOwnershipOrAdmin(notification, actingUser);
    return notification;
};

const markAsRead = async (notificationId, actingUser) => {
    const notification = await Notification.findById(notificationId);
    if (!notification) {
        throw createError("Notification not found", 404);
    }

    assertOwnershipOrAdmin(notification, actingUser);

    if (!notification.isRead) {
        notification.isRead = true;
        notification.deliveryStatus = DELIVERY_STATUSES.READ;
        notification.readAt = new Date();
        await notification.save();

        // Real-time read ack + authoritative count to the notification's
        // owner (an Admin may mark someone else's notification read here).
        try {
            socketService.emitToUser(notification.recipient, SOCKET_EVENTS.NOTIFICATION_READ, {
                id: String(notification._id),
                readAt: notification.readAt,
            });
            await emitCountUpdate(notification.recipient);
        } catch (error) {
            console.error(`[notification] read emit failed: ${error.message}`);
        }
    }

    return notification;
};

// Scoped to the acting user's own notifications — marking "everything"
// unread across the whole system is out of scope for a bulk self-service
// endpoint, even for Admins.
const markAllAsRead = async (actingUser) => {
    const now = new Date();
    const result = await Notification.updateMany(
        { recipient: actingUser._id, isRead: false },
        { $set: { isRead: true, deliveryStatus: DELIVERY_STATUSES.READ, readAt: now } }
    );

    try {
        socketService.emitToUser(actingUser._id, SOCKET_EVENTS.NOTIFICATION_READ_ALL, {});
        await emitCountUpdate(actingUser._id);
    } catch (error) {
        console.error(`[notification] read-all emit failed: ${error.message}`);
    }

    return { matchedCount: result.matchedCount ?? result.n, modifiedCount: result.modifiedCount ?? result.nModified };
};

const deleteNotification = async (notificationId, actingUser) => {
    const notification = await Notification.findById(notificationId);
    if (!notification) {
        throw createError("Notification not found", 404);
    }

    assertOwnershipOrAdmin(notification, actingUser);
    await notification.deleteOne();

    // Cross-tab count sync for whoever owned the deleted notification.
    await emitCountUpdate(notification.recipient);
};

// Scoped to the acting user's own read notifications for the same reason
// as markAllAsRead above.
const deleteAllReadNotifications = async (actingUser) => {
    const result = await Notification.deleteMany({ recipient: actingUser._id, isRead: true });
    await emitCountUpdate(actingUser._id);
    return { deletedCount: result.deletedCount };
};

const countUnread = async (actingUser) =>
    Notification.countDocuments({ recipient: actingUser._id, isRead: false });

const countAll = async (actingUser) =>
    Notification.countDocuments({ recipient: actingUser._id });

// ------------------------------------------------------------------
// Auto-generated shipment lifecycle notifications (STEP 11 / STEP 12).
// These are internal, system-triggered calls — they are never fed
// directly from request bodies, so they intentionally bypass the manual
// `createNotification` permission gate and call `dispatchNotification`
// straight away. `actingUser` is only used to stamp `sender`.
// ------------------------------------------------------------------

const uniqueUserIds = (ids) => {
    const seen = new Set();
    const result = [];
    for (const id of ids) {
        if (!id) continue;
        const key = id.toString();
        if (!seen.has(key)) {
            seen.add(key);
            result.push(id);
        }
    }
    return result;
};

const notifyShipmentCreated = async (shipment, actingUser) => {
    if (!shipment.assignedDispatcher) return null;
    const { title, message } = builder.shipmentCreated(shipment);
    return dispatchNotification({
        title,
        message,
        type: NOTIFICATION_TYPES.SHIPMENT_CREATED,
        priority: NOTIFICATION_PRIORITIES.MEDIUM,
        recipient: shipment.assignedDispatcher,
        sender: actingUser?._id ?? null,
        relatedShipment: shipment._id,
    });
};

const notifyShipmentUpdated = async (shipment, actingUser) => {
    if (!shipment.assignedDispatcher) return null;
    const { title, message } = builder.shipmentUpdated(shipment);
    return dispatchNotification({
        title,
        message,
        type: NOTIFICATION_TYPES.SHIPMENT_UPDATED,
        priority: NOTIFICATION_PRIORITIES.LOW,
        recipient: shipment.assignedDispatcher,
        sender: actingUser?._id ?? null,
        relatedShipment: shipment._id,
    });
};

const notifyShipmentAssigned = async (shipment, actingUser) => {
    if (!shipment.assignedDispatcher) return null;
    const { title, message } = builder.shipmentAssigned(shipment);
    return dispatchNotification({
        title,
        message,
        type: NOTIFICATION_TYPES.SHIPMENT_ASSIGNED,
        priority: NOTIFICATION_PRIORITIES.MEDIUM,
        recipient: shipment.assignedDispatcher,
        sender: actingUser?._id ?? null,
        relatedShipment: shipment._id,
    });
};

const notifyShipmentCancelled = async (shipment, actingUser) => {
    const recipients = uniqueUserIds([shipment.assignedDispatcher, shipment.createdBy]);
    const { title, message } = builder.shipmentCancelled(shipment);
    return Promise.all(
        recipients.map((recipient) =>
            dispatchNotification({
                title,
                message,
                type: NOTIFICATION_TYPES.SHIPMENT_CANCELLED,
                priority: NOTIFICATION_PRIORITIES.HIGH,
                recipient,
                sender: actingUser?._id ?? null,
                relatedShipment: shipment._id,
            })
        )
    );
};

const notifyShipmentDelayed = async (shipment, actingUser) => {
    if (!shipment.assignedDispatcher) return null;
    const { title, message } = builder.shipmentDelayed(shipment);
    return dispatchNotification({
        title,
        message,
        type: NOTIFICATION_TYPES.SHIPMENT_DELAYED,
        priority: NOTIFICATION_PRIORITIES.HIGH,
        recipient: shipment.assignedDispatcher,
        sender: actingUser?._id ?? null,
        relatedShipment: shipment._id,
    });
};

const notifyShipmentDelivered = async (shipment, actingUser) => {
    const recipients = uniqueUserIds([shipment.assignedDispatcher, shipment.createdBy]);
    const { title, message } = builder.shipmentDelivered(shipment);
    return Promise.all(
        recipients.map((recipient) =>
            dispatchNotification({
                title,
                message,
                type: NOTIFICATION_TYPES.SHIPMENT_DELIVERED,
                priority: NOTIFICATION_PRIORITIES.MEDIUM,
                recipient,
                sender: actingUser?._id ?? null,
                relatedShipment: shipment._id,
            })
        )
    );
};

// Called by timelineService.notifyTimelineEvent whenever a status,
// location, dispatcher-assignment, or note event is created.
const notifyTimelineUpdated = async (shipment, eventLabel, recipient, actingUser, relatedTimeline = null) => {
    const { title, message } = builder.timelineEvent(shipment, eventLabel);
    return dispatchNotification({
        title,
        message,
        type: NOTIFICATION_TYPES.TIMELINE_EVENT,
        priority: NOTIFICATION_PRIORITIES.LOW,
        recipient,
        sender: actingUser?._id ?? null,
        relatedShipment: shipment._id,
        relatedTimeline,
    });
};

const notifySystemAnnouncement = async (payload, actingUser) => {
    if (actingUser.role !== ROLES.ADMIN) {
        throw createError("Only Admins can create system announcements", 403);
    }

    const { title, message } = builder.systemAnnouncement(payload.title, payload.message);

    let recipientIds = payload.recipients;
    if (!recipientIds || !recipientIds.length) {
        recipientIds = await User.find({ status: "active" }).distinct("_id");
    }

    return Promise.all(
        recipientIds.map((recipient) =>
            dispatchNotification({
                title,
                message,
                type: NOTIFICATION_TYPES.SYSTEM_ANNOUNCEMENT,
                priority: payload.priority || NOTIFICATION_PRIORITIES.MEDIUM,
                recipient,
                sender: actingUser._id,
            })
        )
    );
};

const notifyWarning = async (recipient, title, message, actingUser = null, relatedShipment = null) =>
    dispatchNotification({
        ...builder.warning(title, message),
        type: NOTIFICATION_TYPES.WARNING,
        priority: NOTIFICATION_PRIORITIES.HIGH,
        recipient,
        sender: actingUser?._id ?? null,
        relatedShipment,
    });

const notifySuccess = async (recipient, title, message, actingUser = null, relatedShipment = null) =>
    dispatchNotification({
        ...builder.success(title, message),
        type: NOTIFICATION_TYPES.SUCCESS,
        priority: NOTIFICATION_PRIORITIES.LOW,
        recipient,
        sender: actingUser?._id ?? null,
        relatedShipment,
    });

const notifyError = async (recipient, title, message, actingUser = null, relatedShipment = null) =>
    dispatchNotification({
        ...builder.error(title, message),
        type: NOTIFICATION_TYPES.ERROR,
        priority: NOTIFICATION_PRIORITIES.CRITICAL,
        recipient,
        sender: actingUser?._id ?? null,
        relatedShipment,
    });

const notifyAIAlert = async (recipient, title, message, actingUser = null, relatedShipment = null) =>
    dispatchNotification({
        ...builder.aiAlert(title, message),
        type: NOTIFICATION_TYPES.AI_ALERT,
        priority: NOTIFICATION_PRIORITIES.HIGH,
        recipient,
        sender: actingUser?._id ?? null,
        relatedShipment,
    });

module.exports = {
    createNotification,
    getNotifications,
    getNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllReadNotifications,
    countUnread,
    countAll,
    notifyShipmentCreated,
    notifyShipmentUpdated,
    notifyShipmentAssigned,
    notifyShipmentCancelled,
    notifyShipmentDelayed,
    notifyShipmentDelivered,
    notifyTimelineUpdated,
    notifySystemAnnouncement,
    notifyWarning,
    notifySuccess,
    notifyError,
    notifyAIAlert,
};