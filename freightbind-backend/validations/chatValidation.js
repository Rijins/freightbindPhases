const { body, param, query } = require("express-validator");

const shipmentIdValidation = [
    param("shipmentId").isMongoId().withMessage("Shipment ID must be a valid MongoDB ID"),
];

const sendMessageValidation = [
    ...shipmentIdValidation,
    body("message")
        .trim()
        .notEmpty()
        .withMessage("Message text is required")
        .isLength({ max: 2000 })
        .withMessage("Message must be at most 2000 characters"),
];

const getMessagesValidation = [
    ...shipmentIdValidation,
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer").toInt(),
    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("Limit must be an integer between 1 and 100")
        .toInt(),
];

module.exports = {
    getChatContextValidation: shipmentIdValidation,
    getMessagesValidation,
    sendMessageValidation,
};
