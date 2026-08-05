// Socket payload serializer for notifications. Pure helper — no database,
// no side effects. Shapes a (possibly populated) Notification document into
// the exact payload emitted on `notification:new`, so every realtime event
// carries the same minimal, client-friendly shape regardless of how the
// document was loaded.

const asMongoId = (value) => {
    if (value === null || value === undefined) return null;
    if (typeof value === "object" && value._id) return value._id.toString();
    return value.toString();
};

const buildNotificationPayload = (notification) => {
    if (!notification) return null;

    const id = asMongoId(notification._id || notification.id);
    const relatedShipment = notification.relatedShipment
        ? {
              // Prefer the human-readable shipmentId (e.g. "FB-...") over the
              // raw Mongo _id, matching what the REST list endpoint surfaces.
              id: asMongoId(notification.relatedShipment),
              shipmentId: notification.relatedShipment.shipmentId || null,
          }
        : null;

    return {
        id,
        notificationId: notification.notificationId || null,
        title: notification.title || "",
        message: notification.message || "",
        type: notification.type || "General",
        priority: notification.priority || "Medium",
        isRead: Boolean(notification.isRead),
        read: Boolean(notification.isRead),
        readAt: notification.readAt || null,
        deliveryStatus: notification.deliveryStatus || "Pending",
        // Unix ms so the client can timestamp realtime cards without parsing ISO strings.
        createdAt: notification.createdAt ? new Date(notification.createdAt).getTime() : Date.now(),
        shipmentId: relatedShipment && relatedShipment.shipmentId
            ? relatedShipment.shipmentId
            : relatedShipment
            ? relatedShipment.id
            : null,
        relatedShipment,
    };
};

module.exports = { buildNotificationPayload };