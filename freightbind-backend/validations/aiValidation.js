const { param } = require("express-validator");

const delayRiskParamValidation = [
  param("shipmentId").isMongoId().withMessage("Shipment ID must be a valid MongoDB ID"),
];

const shipmentSummaryParamValidation = [
  param("shipmentId").isMongoId().withMessage("Shipment ID must be a valid MongoDB ID"),
];

const recommendationsParamValidation = [
  param("shipmentId").isMongoId().withMessage("Shipment ID must be a valid MongoDB ID"),
];

module.exports = {
  delayRiskParamValidation,
  shipmentSummaryParamValidation,
  recommendationsParamValidation,
};
