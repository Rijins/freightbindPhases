const mongoose = require("mongoose");
const crypto = require("crypto");
const {
    NOTIFICATION_TYPES_LIST,
    NOTIFICATION_PRIORITIES_LIST,
    DELIVERY_STATUSES,
    DELIVERY_STATUSES_LIST,
} = require("../constants/notificationTypes");

const notificationSchema = new mongoose.Schema(
    {
        notificationId: {
            type: String,
            required: true,
            unique: true,
            immutable: true,
            default: () => `FBN-${crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()}`,
        },
        title: {
            type: String,
            required: [true, "Notification title is required"],
            trim: true,
        },
        message: {
            type: String,
            required: [true, "Notification message is required"],
            trim: true,
        },
        type: {
            type: String,
            enum: {
                values: NOTIFICATION_TYPES_LIST,
                message: "Type must be one of: " + NOTIFICATION_TYPES_LIST.join(", "),
            },
            required: [true, "Notification type is required"],
        },
        priority: {
            type: String,
            enum: {
                values: NOTIFICATION_PRIORITIES_LIST,
                message: "Priority must be one of: " + NOTIFICATION_PRIORITIES_LIST.join(", "),
            },
            default: "Medium",
        },
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Notification recipient is required"],
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        relatedShipment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Shipment",
            default: null,
        },
        // Populated by timelineService.notifyTimelineEvent whenever a status,
        // location, dispatcher-assignment, or note event is created on a
        // shipment's timeline.
        relatedTimeline: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ShipmentTimeline",
            default: null,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        deliveryStatus: {
            type: String,
            enum: {
                values: DELIVERY_STATUSES_LIST,
                message: "Delivery status must be one of: " + DELIVERY_STATUSES_LIST.join(", "),
            },
            default: DELIVERY_STATUSES.PENDING,
        },
        readAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

notificationSchema.index({ recipient: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ createdAt: -1 });
// Compound index: the most common read pattern is "my newest unread first".
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);