const BasePromptBuilder = require("./basePromptBuilder");

const SEVERITY_LEVELS = ["Critical", "High", "Medium", "Low"];

const MAX_TIMELINE_EVENTS = 15;

const formatDate = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toISOString().slice(0, 19).replace("T", " ");
};

const safeText = (value) => (typeof value === "string" && value.trim() !== "" ? value.trim() : "N/A");

/**
 * Reusable AI Recommendations prompt builder. Pure — it only turns
 * structured shipment + timeline inputs into a prompt string. The model is
 * asked to answer with a strict JSON object of actionable, data-grounded
 * recommendations; the builder's `json: true` flag makes the central AI
 * service request + parse JSON automatically.
 */
class RecommendationsPromptBuilder extends BasePromptBuilder {
  constructor() {
    super({ name: "recommendations", json: true });
  }

  build(inputs) {
    const shipment = inputs.shipment || {};
    const timeline = Array.isArray(inputs.timeline) ? inputs.timeline : [];

    const lines = [
      "Recommend actionable next steps for the following shipment.",
      "",
      "SHIPMENT",
      `- Shipment ID: ${safeText(shipment.shipmentId)}`,
      `- Title: ${safeText(shipment.title)}`,
      `- Status: ${safeText(shipment.status)}`,
      `- Priority: ${safeText(shipment.priority)}`,
      `- Transport mode: ${safeText(shipment.shipmentType)}`,
      `- Origin: ${safeText(shipment.origin)}`,
      `- Destination: ${safeText(shipment.destination)}`,
      `- Current location: ${safeText(shipment.currentLocation)}`,
      `- Cargo type: ${safeText(shipment.cargoType)}`,
      `- Estimated departure: ${formatDate(shipment.estimatedDeparture)}`,
      `- Estimated arrival: ${formatDate(shipment.estimatedArrival)}`,
      `- Actual departure: ${formatDate(shipment.actualDeparture)}`,
      `- Actual arrival: ${formatDate(shipment.actualArrival)}`,
      `- Weight (kg): ${shipment.weight ?? "N/A"}`,
      `- Vehicle: ${safeText(shipment.vehicleNumber)}`,
      `- Container: ${safeText(shipment.containerNumber)}`,
      `- Notes: ${safeText(shipment.notes)}`,
      "",
      "TIMELINE (most recent first)",
      timeline.length === 0
        ? "No timeline events recorded."
        : timeline.slice(0, MAX_TIMELINE_EVENTS).map((event, index) => {
            const details = [
              `${index + 1}. ${formatDate(event.createdAt)} - ${safeText(event.eventType)}`,
              `   Description: ${safeText(event.description)}`,
              event.location ? `   Location: ${event.location}` : null,
              event.statusBefore || event.statusAfter
                ? `   Status: ${event.statusBefore || "?"} -> ${event.statusAfter || "?"}`
                : null,
            ].filter(Boolean).join("\n");
            return details;
          }).join("\n"),
      "",
      "Use only the shipment data above. Never invent events, locations,",
      "dates, statuses or facts. Every recommendation must be directly",
      "actionable by a dispatcher or operator and grounded in the supplied",
      "data. Return 1-5 recommendations ranked by impact.",
      `Severity must be one of: ${SEVERITY_LEVELS.join(", ")}.`,
    ];

    return lines.join("\n");
  }

  systemPrompt() {
    return [
      "You are a logistics operations advisor.",
      "Respond with ONLY a valid JSON object in exactly this shape:",
      '{ "recommendations": [ { "id": "string", "severity": "Critical" | "High" | "Medium" | "Low", "title": "string", "action": "string", "reason": "string" } ] }',
      "id must be a short unique string.",
      "severity, title, action and reason must be non-empty concise strings.",
      "recommendations must be an array of 1 to 5 objects (an empty array is allowed).",
      "Never add fields beyond the shape above.",
    ].join("\n");
  }
}

module.exports = new RecommendationsPromptBuilder();
module.exports.SEVERITY_LEVELS = SEVERITY_LEVELS;
