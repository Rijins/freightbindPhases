const { body, param, query } = require("express-validator");
const { NOTIFICATION_PRIORITIES_LIST } = require("../constants/notificationTypes");

const ANNOUNCEMENT_STATUSES = ["active", "inactive"];
const ANNOUNCEMENT_EDITABLE_FIELDS = [
    "title",
    "message",
    "priority",
    "status",
    "startDate",
    "endDate",
];
const ANNOUNCEMENT_SORT_FIELDS = ["createdAt", "updatedAt", "title", "priority", "status"];

// Cross-field rule shared by create and update: when both dates are provided,
// the end date must not precede the start date.
const assertDatesOrder = (req) => {
    const { startDate, endDate } = req.body || {};
    if (!startDate || !endDate) return true;
    if (new Date(endDate).getTime() < new Date(startDate).getTime()) {
        throw new Error("End date must be on or after the start date");
    }
    return true;
};

const createAnnouncementValidation = [
    body("title").trim().notEmpty().withMessage("Title is required"),

    body("message").trim().notEmpty().withMessage("Message is required"),

    body("priority")
        .optional()
        .isIn(NOTIFICATION_PRIORITIES_LIST)
        .withMessage(`Priority must be one of: ${NOTIFICATION_PRIORITIES_LIST.join(", ")}`),

    body("status")
        .optional()
        .isIn(ANNOUNCEMENT_STATUSES)
        .withMessage(`Status must be one of: ${ANNOUNCEMENT_STATUSES.join(", ")}`),

    body("startDate").optional({ nullable: true }).isISO8601().withMessage("Start date must be a valid date"),

    body("endDate").optional({ nullable: true }).isISO8601().withMessage("End date must be a valid date"),

    body().custom((value, { req }) => {
        const requestBody = req.body || {};
        const invalidFields = Object.keys(requestBody).filter(
            (field) => !ANNOUNCEMENT_EDITABLE_FIELDS.includes(field)
        );
        if (invalidFields.length) {
            throw new Error(`Unsupported announcement fields: ${invalidFields.join(", ")}`);
        }
        return assertDatesOrder(req);
    }),
];

const updateAnnouncementValidation = [
    body("title").optional().trim().notEmpty().withMessage("Title cannot be empty"),

    body("message").optional().trim().notEmpty().withMessage("Message cannot be empty"),

    body("priority")
        .optional()
        .isIn(NOTIFICATION_PRIORITIES_LIST)
        .withMessage(`Priority must be one of: ${NOTIFICATION_PRIORITIES_LIST.join(", ")}`),

    body("status")
        .optional()
        .isIn(ANNOUNCEMENT_STATUSES)
        .withMessage(`Status must be one of: ${ANNOUNCEMENT_STATUSES.join(", ")}`),

    body("startDate").optional({ nullable: true }).isISO8601().withMessage("Start date must be a valid date"),

    body("endDate").optional({ nullable: true }).isISO8601().withMessage("End date must be a valid date"),

    body().custom((value, { req }) => {
        const requestBody = req.body || {};
        const invalidFields = Object.keys(requestBody).filter(
            (field) => !ANNOUNCEMENT_EDITABLE_FIELDS.includes(field)
        );
        if (invalidFields.length) {
            throw new Error(`Unsupported announcement fields: ${invalidFields.join(", ")}`);
        }
        return assertDatesOrder(req);
    }),
];

const announcementStatusValidation = [
    param("id").isMongoId().withMessage("Announcement ID must be a valid MongoDB ID"),
    body("status")
        .isIn(ANNOUNCEMENT_STATUSES)
        .withMessage(`Status must be one of: ${ANNOUNCEMENT_STATUSES.join(", ")}`),
];

const announcementIdValidation = [
    param("id").isMongoId().withMessage("Announcement ID must be a valid MongoDB ID"),
];

const getAnnouncementsValidation = [
    query("search").optional().trim().isString().withMessage("Search must be a string"),
    query("status")
        .optional()
        .isIn(ANNOUNCEMENT_STATUSES)
        .withMessage(`Invalid status. Must be one of: ${ANNOUNCEMENT_STATUSES.join(", ")}`),
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer").toInt(),
    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("Limit must be an integer between 1 and 100")
        .toInt(),
    query("sortBy")
        .optional()
        .isIn(ANNOUNCEMENT_SORT_FIELDS)
        .withMessage("Invalid sort field"),
    query("order").optional().isIn(["asc", "desc"]).withMessage("Order must be asc or desc"),
];

module.exports = {
    createAnnouncementValidation,
    updateAnnouncementValidation,
    announcementStatusValidation,
    announcementIdValidation,
    getAnnouncementsValidation,
};
