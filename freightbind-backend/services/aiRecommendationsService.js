const Shipment = require("../models/Shipment");
const ShipmentTimeline = require("../models/ShipmentTimeline");
const aiService = require("./aiService");
const { assertCanViewShipment } = require("../helpers/aiAccess");

const SEVERITY_LEVELS = ["Critical", "High", "Medium", "Low"];

const TIMELINE_EVENT_LIMIT = 15;
const MAX_RECOMMENDATIONS = 6;

const FALLBACK_RECOMMENDATIONS = Object.freeze([
    {
        id: "fallback-1",
        severity: "Low",
        title: "Recommendations unavailable",
        action: "Monitor the shipment manually until AI recommendations recover.",
        reason: "AI recommendation generation is temporarily unavailable.",
        shipmentId: null,
    },
]);

const cleanString = (value, fallback = "") => {
    if (typeof value !== "string" || value.trim() === "") return fallback;
    return value.trim();
};

const clampId = (value, index) => {
    const clean = cleanString(value);
    return clean.slice(0, 64) || `rec-${index + 1}`;
};

/**
 * Feature-specific normalizer. Maps whatever the AI returned (or nothing at
 * all) into the guaranteed-safe recommendation shape:
 * { id, severity, title, action, reason, shipmentId }.
 * - never throws
 * - severity restricted to Critical | High | Medium | Low (invalid -> Low)
 * - count capped at MAX_RECOMMENDATIONS
 * - malformed entries (missing title/action, non-string fields) rejected
 * - shipmentId is always stamped from the real shipment, never the AI
 */
const normalizeRecommendations = (raw, shipmentId = null) => {
    if (!raw || typeof raw !== "object" || !Array.isArray(raw.recommendations)) {
        return FALLBACK_RECOMMENDATIONS.map((item) => ({
            ...item,
            shipmentId: shipmentId,
        }));
    }

    const items = [];
    for (const entry of raw.recommendations) {
        if (items.length >= MAX_RECOMMENDATIONS) break;
        if (!entry || typeof entry !== "object" || Array.isArray(entry)) continue;

        const title = cleanString(entry.title);
        const action = cleanString(entry.action);
        if (!title || !action) continue;

        items.push({
            id: clampId(entry.id, items.length),
            severity: SEVERITY_LEVELS.includes(entry.severity) ? entry.severity : "Low",
            title,
            action,
            reason: cleanString(entry.reason),
            shipmentId: shipmentId,
        });
    }

    if (items.length === 0) {
        return FALLBACK_RECOMMENDATIONS.map((item) => ({
            ...item,
            shipmentId: shipmentId,
        }));
    }

    return items;
};

/** Loads shipment doc + most recent timeline events (append-only audit log). */
const collectShipmentContext = async (shipmentId) => {
    const shipment = await Shipment.findById(shipmentId).lean();
    if (!shipment) return null;
    const timeline = await ShipmentTimeline.find({ shipment: shipment._id })
        .sort({ createdAt: -1 })
        .limit(TIMELINE_EVENT_LIMIT)
        .lean();
    return { shipment, timeline };
};

const generateRecommendations = async (shipmentId, actingUser) => {
    const context = await collectShipmentContext(shipmentId);
    if (!context) return null;

    assertCanViewShipment(context.shipment, actingUser);

    const result = await aiService.safeComplete({
        feature: "shipment:recommendations",
        builderName: "recommendations",
        inputs: { shipment: context.shipment, timeline: context.timeline },
        options: { json: true },
    });

    return normalizeRecommendations(
        result.success ? result.data : null,
        context.shipment.shipmentId || String(context.shipment._id)
    );
};

/** Public entry point — throws 404 when shipment missing; AI failures are safe. */
const getRecommendations = async (shipmentId, actingUser) => {
    const recommendations = await generateRecommendations(shipmentId, actingUser);
    if (!recommendations) {
        const error = new Error("Shipment not found");
        error.statusCode = 404;
        throw error;
    }
    return recommendations;
};

module.exports = {
    getRecommendations,
    normalizeRecommendations,
    FALLBACK_RECOMMENDATIONS,
    SEVERITY_LEVELS,
};
