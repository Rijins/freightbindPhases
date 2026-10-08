const Shipment = require("../models/Shipment");
const ShipmentTimeline = require("../models/ShipmentTimeline");
const aiService = require("./aiService");
const { assertCanViewShipment } = require("../helpers/aiAccess");
const { maybeRaiseHighRiskAlert } = require("./aiAlertService");

const RISK_LEVELS = ["Low", "Medium", "High"];

const TIMELINE_EVENT_LIMIT = 15;
const MAX_REASONS = 5;
const MAX_RECOMMENDATIONS = 5;

const FALLBACK_PREDICTION = Object.freeze({
  risk: "Low",
  confidence: 0,
  summary:
    "Delay prediction is unavailable right now. Please try again shortly.",
  reasons: [],
  recommendations: ["Monitor the shipment manually until AI prediction recovers."],
});

const clampConfidence = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.min(1, Math.max(0, number));
};

const cleanStringList = (value, limit) => {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => typeof item === "string" && item.trim() !== "")
    .map((item) => item.trim())
    .slice(0, limit);
};

/**
 * Feature-specific normalizer. Maps whatever the AI returned (or nothing at
 * all) into the guaranteed-safe prediction shape:
 * { risk, confidence, summary, reasons, recommendations }.
 * Any missing/invalid field degrades to a default — never throws.
 */
const normalizeDelayRiskPrediction = (raw) => {
  if (!raw || typeof raw !== "object") {
    return { ...FALLBACK_PREDICTION };
  }

  const risk = RISK_LEVELS.includes(raw.risk) ? raw.risk : "Low";
  const confidence = clampConfidence(raw.confidence);
  const summary =
    typeof raw.summary === "string" && raw.summary.trim() !== ""
      ? raw.summary.trim()
      : FALLBACK_PREDICTION.summary;

  return {
    risk,
    confidence,
    summary,
    reasons: cleanStringList(raw.reasons, MAX_REASONS),
    recommendations: cleanStringList(raw.recommendations, MAX_RECOMMENDATIONS),
  };
};

/**
 * Loads everything the prompt needs for one shipment: the shipment document
 * and its most recent timeline events (append-only audit log).
 */
const collectShipmentContext = async (shipmentId) => {
  const shipment = await Shipment.findById(shipmentId).lean();
  if (!shipment) return null;

  const timeline = await ShipmentTimeline.find({ shipment: shipment._id })
    .sort({ createdAt: -1 })
    .limit(TIMELINE_EVENT_LIMIT)
    .lean();

  return { shipment, timeline };
};

/**
 * Public entry point — the only API the controller calls.
 * Throws a 404 when the shipment does not exist; every AI outcome
 * (success, timeout, provider failure, invalid response) yields a safe
 * structured prediction. A genuinely High-risk prediction fires the
 * persisted AI alert pipeline (best-effort, never throws, deduped).
 */
const getDelayRisk = async (shipmentId, actingUser) => {
  const context = await collectShipmentContext(shipmentId);
  if (!context) {
    const error = new Error("Shipment not found");
    error.statusCode = 404;
    throw error;
  }

  assertCanViewShipment(context.shipment, actingUser);

  const result = await aiService.safeComplete({
    feature: "delay:risk",
    builderName: "delayRisk",
    inputs: { shipment: context.shipment, timeline: context.timeline },
    options: { json: true },
  });

  const prediction = normalizeDelayRiskPrediction(result.success ? result.data : null);

  await maybeRaiseHighRiskAlert({
    shipment: context.shipment,
    prediction,
    actingUser,
  });

  return prediction;
};

module.exports = { getDelayRisk, normalizeDelayRiskPrediction, FALLBACK_PREDICTION };
