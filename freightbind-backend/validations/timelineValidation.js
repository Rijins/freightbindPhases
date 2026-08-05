const { body, param } = require("express-validator");
const { SHIPMENT_STATUSES } = require("../models/Shipment");

// ---------- Route Param Validation ----------
const shipmentIdParamValidation = [
  param("shipmentId").isMongoId().withMessage("Shipment ID must be a valid MongoDB ID"),
];

// ---------- Get Timeline ----------
const getTimelineValidation = shipmentIdParamValidation;

// ---------- Get Latest Timeline Event ----------
const getLatestTimelineValidation = shipmentIdParamValidation;

// ---------- Status Update ----------
const statusUpdateValidation = [
  body("shipmentId").isMongoId().withMessage("Shipment ID must be a valid MongoDB ID"),
  body("status")
    .trim()
    .notEmpty()
    .withMessage("Status is required")
    .isIn(SHIPMENT_STATUSES)
    .withMessage(`Status must be one of: ${SHIPMENT_STATUSES.join(", ")}`),
  body("note")
    .optional({ nullable: true })
    .isString()
    .withMessage("Note must be a string")
    .trim(),
];

// ---------- Location Update ----------
const locationUpdateValidation = [
  body("shipmentId").isMongoId().withMessage("Shipment ID must be a valid MongoDB ID"),
  body("location").trim().notEmpty().withMessage("Location is required"),
];

// ---------- Dispatcher Assignment ----------
const dispatcherAssignValidation = [
  body("shipmentId").isMongoId().withMessage("Shipment ID must be a valid MongoDB ID"),
  body("dispatcherId").isMongoId().withMessage("Dispatcher ID must be a valid MongoDB ID"),
];

// ---------- Note Added ----------
const noteValidation = [
  body("shipmentId").isMongoId().withMessage("Shipment ID must be a valid MongoDB ID"),
  body("note").trim().notEmpty().withMessage("Note is required"),
];

module.exports = {
  shipmentIdParamValidation,
  getTimelineValidation,
  getLatestTimelineValidation,
  statusUpdateValidation,
  locationUpdateValidation,
  dispatcherAssignValidation,
  noteValidation,
};
