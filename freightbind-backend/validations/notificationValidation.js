const { body, param, query } = require("express-validator");
const {
    NOTIFICATION_TYPES_LIST,
    NOTIFICATION_PRIORITIES_LIST,
    DELIVERY_STATUSES_LIST,
} = require("../constants/notificationTypes");

const createNotificationValidation = [
    body("title").trim().notEmpty().withMessage("Notification title is required"),
    body("message").trim().notEmpty().withMessage("Notification message is required"),
    body("type")
        .notEmpty()
        .withMessage("Notification type is required")
        .isIn(NOTIFICATION_TYPES_LIST)
        .withMessage(`Type must be one of: ${NOTIFICATION_TYPES_LIST.join(", ")}`),
    body("priority")
        .optional()
        .isIn(NOTIFICATION_PRIORITIES_LIST)
        .withMessage(`Priority must be one of: ${NOTIFICATION_PRIORITIES_LIST.join(", ")}`),
    body("recipient").isMongoId().withMessage("Recipient must be a valid user ID"),
    body("relatedShipment")
        .optional({ nullable: true })
        .isMongoId()
        .withMessage("Related shipment must be a valid shipment ID"),
    body("relatedTimeline")
        .optional({ nullable: true })
        .isMongoId()
        .withMessage("Related timeline must be a valid timeline ID"),
];

const notificationIdValidation = [
    param("id").isMongoId().withMessage("Notification ID must be a valid MongoDB ID"),
];

const getNotificationsValidation = [
    query("search").optional().trim().isString().withMessage("Search must be a string"),
    query("type").optional().isIn(NOTIFICATION_TYPES_LIST).withMessage("Invalid notification type"),
    query("priority")
        .optional()
        .isIn(NOTIFICATION_PRIORITIES_LIST)
        .withMessage("Invalid notification priority"),
    query("read")
        .optional()
        .isBoolean()
        .withMessage("Read must be a boolean")
        .toBoolean(),
    query("recipient").optional().isMongoId().withMessage("Recipient must be a valid user ID"),
    query("deliveryStatus")
        .optional()
        .isIn(DELIVERY_STATUSES_LIST)
        .withMessage("Invalid delivery status"),
    query("dateFrom")
        .optional()
        .isISO8601()
        .withMessage("dateFrom must be a valid ISO 8601 date")
        .toDate(),
    query("dateTo")
        .optional()
        .isISO8601()
        .withMessage("dateTo must be a valid ISO 8601 date")
        .toDate(),
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer").toInt(),
    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("Limit must be an integer between 1 and 100")
        .toInt(),
    query("sortBy")
        .optional()
        .isIn(["createdAt", "priority", "type", "isRead"])
        .withMessage("Invalid sort field"),
    query("order").optional().isIn(["asc", "desc"]).withMessage("Order must be asc or desc"),
];

module.exports = {
    createNotificationValidation,
    notificationIdValidation,
    getNotificationsValidation,
};
