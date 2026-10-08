const express = require("express");
const router = express.Router();

const aiController = require("../controllers/aiController");
const { protect } = require("../middleware/auth");
const validateRequest = require("../middleware/validateRequest");
const {
  delayRiskParamValidation,
  shipmentSummaryParamValidation,
  recommendationsParamValidation,
} = require("../validations/aiValidation");

router.post(
  "/delay-risk/:shipmentId",
  protect,
  delayRiskParamValidation,
  validateRequest,
  aiController.getDelayRisk
);

router.post(
  "/shipment-summary/:shipmentId",
  protect,
  shipmentSummaryParamValidation,
  validateRequest,
  aiController.getShipmentSummary
);

router.post(
  "/recommendations/:shipmentId",
  protect,
  recommendationsParamValidation,
  validateRequest,
  aiController.getRecommendations
);

module.exports = router;
