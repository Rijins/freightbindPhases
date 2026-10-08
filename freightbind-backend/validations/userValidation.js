const { body, param, query } = require("express-validator");
const { ROLES_LIST } = require("../constants/roles");

const USER_STATUSES = ["active", "inactive", "suspended"];

const USER_EDITABLE_FIELDS = ["fullName", "email", "phone", "role", "status", "hub"];
const USER_SORT_FIELDS = ["createdAt", "updatedAt", "fullName", "email", "role", "status"];

const createUserValidation = [
    body("fullName")
        .trim()
        .notEmpty()
        .withMessage("Full name is required"),

    body("email")
        .trim()
        .isEmail()
        .withMessage("Valid email is required")
        .normalizeEmail(),

    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),

    body("phone")
        .optional({ nullable: true })
        .isString()
        .withMessage("Phone must be a string"),

    body("role")
        .isIn(ROLES_LIST)
        .withMessage(`Role must be one of: ${ROLES_LIST.join(", ")}`),

    body("hub")
        .optional({ nullable: true })
        .isMongoId()
        .withMessage("Hub must be a valid hub ID"),

    body().custom((value, { req }) => {
        const requestBody = req.body || {};
        const invalidFields = Object.keys(requestBody).filter(
            (field) => !["fullName", "email", "password", "phone", "role", "hub"].includes(field)
        );
        if (invalidFields.length) {
            throw new Error(`Unsupported user fields: ${invalidFields.join(", ")}`);
        }
        return true;
    }),
];

const updateUserValidation = [
    body("fullName")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Full name cannot be empty"),

    body("email")
        .optional()
        .trim()
        .isEmail()
        .withMessage("Valid email is required")
        .normalizeEmail(),

    body("phone")
        .optional({ nullable: true })
        .isString()
        .withMessage("Phone must be a string"),

    body("role")
        .optional()
        .isIn(ROLES_LIST)
        .withMessage(`Role must be one of: ${ROLES_LIST.join(", ")}`),

    body("status")
        .optional()
        .isIn(USER_STATUSES)
        .withMessage(`Status must be one of: ${USER_STATUSES.join(", ")}`),

    body("hub")
        .optional({ nullable: true })
        .isMongoId()
        .withMessage("Hub must be a valid hub ID"),

    body().custom((value, { req }) => {
        const requestBody = req.body || {};
        const invalidFields = Object.keys(requestBody).filter(
            (field) => !USER_EDITABLE_FIELDS.includes(field)
        );
        if (invalidFields.length) {
            throw new Error(`Unsupported user fields: ${invalidFields.join(", ")}`);
        }
        return true;
    }),
];

const updateUserStatusValidation = [
    param("id").isMongoId().withMessage("User ID must be a valid MongoDB ID"),
    body("status")
        .isIn(USER_STATUSES)
        .withMessage(`Status must be one of: ${USER_STATUSES.join(", ")}`),
];

const userIdValidation = [
    param("id").isMongoId().withMessage("User ID must be a valid MongoDB ID"),
];

const getUsersValidation = [
    query("search").optional().trim().isString().withMessage("Search must be a string"),
    query("role").optional().isIn(ROLES_LIST).withMessage(`Invalid role. Must be one of: ${ROLES_LIST.join(", ")}`),
    query("status")
        .optional()
        .isIn(USER_STATUSES)
        .withMessage(`Invalid status. Must be one of: ${USER_STATUSES.join(", ")}`),
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer").toInt(),
    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("Limit must be an integer between 1 and 100")
        .toInt(),
    query("sortBy")
        .optional()
        .isIn(USER_SORT_FIELDS)
        .withMessage("Invalid sort field"),
    query("order").optional().isIn(["asc", "desc"]).withMessage("Order must be asc or desc"),
];

// Dispatcher-candidate lookup for the shipment assignment selector. Role and
// status are intentionally not queryable — the service hard-filters to active
// Carrier Dispatchers so the backend stays the source of truth.
const getDispatchersValidation = [
    query("search").optional().trim().isString().withMessage("Search must be a string"),
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer").toInt(),
    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("Limit must be an integer between 1 and 100")
        .toInt(),
];

module.exports = {
    createUserValidation,
    updateUserValidation,
    updateUserStatusValidation,
    userIdValidation,
    getUsersValidation,
    getDispatchersValidation,
};
