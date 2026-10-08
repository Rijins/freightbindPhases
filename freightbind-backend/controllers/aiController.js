const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../helpers/apiResponse");
const delayRiskService = require("../services/delayRiskService");
const shipmentSummaryService = require("../services/shipmentSummaryService");
const aiRecommendationsService = require("../services/aiRecommendationsService");

const getDelayRisk = asyncHandler(async (req, res) => {
  const prediction = await delayRiskService.getDelayRisk(req.params.shipmentId, req.user);
  return success(res, {
    message: "Delay risk prediction generated successfully",
    data: { prediction },
  });
});

const getShipmentSummary = asyncHandler(async (req, res) => {
  const summary = await shipmentSummaryService.getShipmentSummary(req.params.shipmentId, req.user);
  return success(res, {
    message: "Shipment summary generated successfully",
    data: { summary },
  });
});

const getRecommendations = asyncHandler(async (req, res) => {
  const recommendations = await aiRecommendationsService.getRecommendations(
    req.params.shipmentId,
    req.user
  );
  return success(res, {
    message: "AI recommendations generated successfully",
    data: { recommendations },
  });
});

module.exports = { getDelayRisk, getShipmentSummary, getRecommendations };
