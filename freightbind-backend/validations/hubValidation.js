const { body, param, query } = require("express-validator");
const { HUB_TYPES, HUB_STATUSES } = require("../models/Hub");

const HUB_EDITABLE_FIELDS = ["name", "location", "type", "status", "capacity"];
const HUB_SORT_FIELDS = ["createdAt", "updatedAt", "name", "type", "status", "location"];

const createHubValidation = [
    body("name").trim().notEmpty().withMessage("Hub name is required"),
    body("location").trim().notEmpty().withMessage("Hub location is required"),
    body("type")
        .isIn(HUB_TYPES)
        .withMessage(`Hub type must be one of: ${HUB_TYPES.join(", ")}`),
    body("status")
        .optional()
        .isIn(HUB_STATUSES)
        .withMessage(`Hub status must be one of: ${HUB_STATUSES.join(", ")}`),
    body("capacity")
        .optional({ values: "null" })
        .isFloat({ min: 0 })
        .withMessage("Capacity must be a non-negative number"),
    body().custom((value, { req }) => {
        const requestBody = req.body || {};
        const invalidFields = Object.keys(requestBody).filter(
            (field) => !HUB_EDITABLE_FIELDS.includes(field)
        );
        if (invalidFields.length) {
            throw new Error(`Unsupported hub fields: ${invalidFields.join(", ")}`);
        }
        return true;
    }),
];

const updateHubValidation = [
    body("name").optional().trim().notEmpty().withMessage("Hub name cannot be empty"),
    body("location").optional().trim().notEmpty().withMessage("Hub location cannot be empty"),
    body("type")
        .optional()
        .isIn(HUB_TYPES)
        .withMessage(`Hub type must be one of: ${HUB_TYPES.join(", ")}`),
    body("status")
        .optional()
        .isIn(HUB_STATUSES)
        .withMessage(`Hub status must be one of: ${HUB_STATUSES.join(", ")}`),
    body("capacity")
        .optional({ values: "null" })
        .isFloat({ min: 0 })
        .withMessage("Capacity must be a non-negative number"),
    body().custom((value, { req }) => {
        const requestBody = req.body || {};
        const invalidFields = Object.keys(requestBody).filter(
            (field) => !HUB_EDITABLE_FIELDS.includes(field)
        );
        if (invalidFields.length) {
            throw new Error(`Unsupported hub fields: ${invalidFields.join(", ")}`);
        }
        return true;
    }),
];

const hubStatusValidation = [
    param("id").isMongoId().withMessage("Hub ID must be a valid MongoDB ID"),
    body("status")
        .isIn(HUB_STATUSES)
        .withMessage(`Hub status must be one of: ${HUB_STATUSES.join(", ")}`),
];

const hubIdValidation = [
    param("id").isMongoId().withMessage("Hub ID must be a valid MongoDB ID"),
];

const getHubsValidation = [
    query("search").optional().trim().isString().withMessage("Search must be a string"),
    query("type")
        .optional()
        .isIn(HUB_TYPES)
        .withMessage(`Invalid hub type. Must be one of: ${HUB_TYPES.join(", ")}`),
    query("status")
        .optional()
        .isIn(HUB_STATUSES)
        .withMessage(`Invalid hub status. Must be one of: ${HUB_STATUSES.join(", ")}`),
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer").toInt(),
    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("Limit must be an integer between 1 and 100")
        .toInt(),
    query("sortBy")
        .optional()
        .isIn(HUB_SORT_FIELDS)
        .withMessage("Invalid sort field"),
    query("order").optional().isIn(["asc", "desc"]).withMessage("Order must be asc or desc"),
];

module.exports = {
    createHubValidation,
    updateHubValidation,
    hubStatusValidation,
    hubIdValidation,
    getHubsValidation,
};
