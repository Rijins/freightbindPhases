const Shipment = require("../models/Shipment");
const ShipmentTimeline = require("../models/ShipmentTimeline");
const aiService = require("./aiService");
const { assertCanViewShipment } = require("../helpers/aiAccess");

const TIMELINE_EVENT_LIMIT = 15;
const MAX_MILESTONES = 8;
const MAX_CONCERNS = 8;

const FALLBACK_SUMMARY = Object.freeze({
  overview: "A shipment summary is unavailable right now. Please try again shortly.",
  milestones: [],
  currentProgress: "Progress tracking is unavailable for this shipment at the moment.",
  concerns: [],
  nextAction: "Review the shipment manually until the AI summary recovers.",
});

const cleanStringList = (value, limit) => {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => typeof item === "string" && item.trim() !== "")
    .map((item) => item.trim())
    .slice(0, limit);
};

const cleanString = (value, fallback) => {
  if (typeof value !== "string" || value.trim() === "") {
    return typeof fallback === "string" ? fallback : "";
  }
  return value.trim();
};

/** Feature-specific normalizer — never throws; degrades to safe defaults. */
const normalizeShipmentSummary = (raw) => {
  if (!raw || typeof raw !== "object") return { ...FALLBACK_SUMMARY };
  return {
    overview: cleanString(raw.overview, FALLBACK_SUMMARY.overview),
    milestones: cleanStringList(raw.milestones, MAX_MILESTONES),
    currentProgress: cleanString(raw.currentProgress, FALLBACK_SUMMARY.currentProgress),
    concerns: cleanStringList(raw.concerns, MAX_CONCERNS),
    nextAction: cleanString(raw.nextAction, FALLBACK_SUMMARY.nextAction),
  };
};

/** Loads shipment doc (with dispatcher) + most recent timeline events. */
const collectShipmentContext = async (shipmentId) => {
  const shipment = await Shipment.findById(shipmentId)
    .populate("assignedDispatcher", "fullName email role")
    .lean();
  if (!shipment) return null;
  const timeline = await ShipmentTimeline.find({ shipment: shipment._id })
    .sort({ createdAt: -1 })
    .limit(TIMELINE_EVENT_LIMIT)
    .lean();
  return { shipment, timeline };
};

/** Public entry point — throws 404 when shipment missing; AI failures are safe. */
const getShipmentSummary = async (shipmentId, actingUser) => {
  const context = await collectShipmentContext(shipmentId);
  if (!context) {
    const error = new Error("Shipment not found");
    error.statusCode = 404;
    throw error;
  }

  assertCanViewShipment(context.shipment, actingUser);

  const result = await aiService.safeComplete({
    feature: "shipment:summary",
    builderName: "shipmentSummary",
    inputs: { shipment: context.shipment, timeline: context.timeline },
    options: { json: true },
  });

  return normalizeShipmentSummary(result.success ? result.data : null);
};

module.exports = { getShipmentSummary, normalizeShipmentSummary, FALLBACK_SUMMARY };