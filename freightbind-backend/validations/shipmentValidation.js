const { body, param, query } = require("express-validator");
const { SHIPMENT_STATUSES, SHIPMENT_PRIORITIES } = require("../models/Shipment");

const shipmentFields = [
  "title",
  "description",
  "cargoType",
  "shipmentType",
  "origin",
  "destination",
  "currentLocation",
  "priority",
  "status",
  "assignedDispatcher",
  "hub",
  "estimatedDeparture",
  "estimatedArrival",
  "actualDeparture",
  "actualArrival",
  "weight",
  "containerNumber",
  "vehicleNumber",
  "notes",
];

const optionalString = (field, message) =>
  body(field).optional({ nullable: true }).isString().withMessage(message).trim();

const optionalDate = (field) =>
  body(field)
    .optional({ nullable: true })
    .isISO8601()
    .withMessage(`${field} must be a valid ISO 8601 date`)
    .toDate();

const shipmentFieldValidation = (required = false) => [
  required
    ? body("title").trim().notEmpty().withMessage("Shipment title is required")
    : body("title").optional().trim().notEmpty().withMessage("Shipment title cannot be empty"),
  optionalString("description", "Description must be a string"),
  required
    ? body("cargoType").trim().notEmpty().withMessage("Cargo type is required")
    : body("cargoType").optional().trim().notEmpty().withMessage("Cargo type cannot be empty"),
  required
    ? body("shipmentType").trim().notEmpty().withMessage("Shipment type is required")
    : body("shipmentType").optional().trim().notEmpty().withMessage("Shipment type cannot be empty"),
  required
    ? body("origin").trim().notEmpty().withMessage("Origin is required")
    : body("origin").optional().trim().notEmpty().withMessage("Origin cannot be empty"),
  required
    ? body("destination").trim().notEmpty().withMessage("Destination is required")
    : body("destination").optional().trim().notEmpty().withMessage("Destination cannot be empty"),
  optionalString("currentLocation", "Current location must be a string"),
  body("priority")
    .optional()
    .isIn(SHIPMENT_PRIORITIES)
    .withMessage(`Priority must be one of: ${SHIPMENT_PRIORITIES.join(", ")}`),
  body("status")
    .optional()
    .isIn(SHIPMENT_STATUSES)
    .withMessage(`Status must be one of: ${SHIPMENT_STATUSES.join(", ")}`),
  body("assignedDispatcher")
    .optional({ nullable: true })
    .isMongoId()
    .withMessage("Assigned dispatcher must be a valid user ID"),
  body("hub")
    .optional({ nullable: true })
    .isMongoId()
    .withMessage("Hub must be a valid hub ID"),
  optionalDate("estimatedDeparture"),
  optionalDate("estimatedArrival"),
  optionalDate("actualDeparture"),
  optionalDate("actualArrival"),
  body("weight")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage("Weight must be a non-negative number")
    .toFloat(),
  optionalString("containerNumber", "Container number must be a string"),
  optionalString("vehicleNumber", "Vehicle number must be a string"),
  optionalString("notes", "Notes must be a string"),
  body().custom((value, { req }) => {
    const requestBody = req.body || {};
    const invalidFields = Object.keys(requestBody).filter((field) => !shipmentFields.includes(field));
    if (invalidFields.length) {
      throw new Error(`Unsupported shipment fields: ${invalidFields.join(", ")}`);
    }
    return true;
  }),
];

const createShipmentValidation = shipmentFieldValidation(true);
const updateShipmentValidation = shipmentFieldValidation(false);

const shipmentIdValidation = [
  param("id").isMongoId().withMessage("Shipment ID must be a valid MongoDB ID"),
];

const getShipmentsValidation = [
  query("search").optional().trim().isString().withMessage("Search must be a string"),
  query("status").optional().isIn(SHIPMENT_STATUSES).withMessage("Invalid shipment status"),
  query("priority").optional().isIn(SHIPMENT_PRIORITIES).withMessage("Invalid shipment priority"),
  query("cargoType").optional().trim().isString().withMessage("Cargo type must be a string"),
  query("shipmentType").optional().trim().isString().withMessage("Shipment type must be a string"),
  query("origin").optional().trim().isString().withMessage("Origin must be a string"),
  query("destination").optional().trim().isString().withMessage("Destination must be a string"),
  query("createdBy").optional().isMongoId().withMessage("Created by must be a valid user ID"),
  query("assignedDispatcher")
    .optional()
    .isMongoId()
    .withMessage("Assigned dispatcher must be a valid user ID"),
  query("hub")
    .optional()
    .isMongoId()
    .withMessage("Hub must be a valid hub ID"),
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer").toInt(),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be an integer between 1 and 100")
    .toInt(),
  query("sortBy")
    .optional()
    .isIn(["createdAt", "updatedAt", "shipmentId", "title", "status", "priority", "estimatedDeparture", "estimatedArrival"])
    .withMessage("Invalid sort field"),
  query("order").optional().isIn(["asc", "desc"]).withMessage("Order must be asc or desc"),
];

module.exports = {
  createShipmentValidation,
  updateShipmentValidation,
  shipmentIdValidation,
  getShipmentsValidation,
};
