const BasePromptBuilder = require("./basePromptBuilder");

const RISK_LEVELS = ["Low", "Medium", "High"];

const MAX_TIMELINE_EVENTS = 15;

const formatDate = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toISOString().slice(0, 19).replace("T", " ");
};

/**
 * Reusable Delay Risk prompt builder. Pure — it only turns structured
 * shipment + timeline inputs into a prompt string. The model is asked to
 * answer with a strict JSON object; the builder's `json: true` flag makes
 * the central AI service request + parse JSON automatically.
 */
class DelayRiskPromptBuilder extends BasePromptBuilder {
  constructor() {
    super({ name: "delayRisk", json: true });
  }

  build(inputs) {
    const shipment = inputs.shipment || {};
    const timeline = Array.isArray(inputs.timeline) ? inputs.timeline : [];

    const lines = [
      "Predict the delay risk for the following shipment.",
      "",
      "SHIPMENT",
      `- Reference: ${shipment.shipmentId || "N/A"}`,
      `- Title: ${shipment.title || "N/A"}`,
      `- Status: ${shipment.status || "N/A"}`,
      `- Priority: ${shipment.priority || "N/A"}`,
      `- Origin: ${shipment.origin || "N/A"}`,
      `- Destination: ${shipment.destination || "N/A"}`,
      `- Current location: ${shipment.currentLocation || "N/A"}`,
      `- Cargo type: ${shipment.cargoType || "N/A"}`,
      `- Shipment type: ${shipment.shipmentType || "N/A"}`,
      `- Estimated departure: ${formatDate(shipment.estimatedDeparture)}`,
      `- Estimated arrival: ${formatDate(shipment.estimatedArrival)}`,
      `- Actual departure: ${formatDate(shipment.actualDeparture)}`,
      `- Actual arrival: ${formatDate(shipment.actualArrival)}`,
      `- Weight (kg): ${shipment.weight ?? "N/A"}`,
      `- Vehicle: ${shipment.vehicleNumber || "N/A"}`,
      `- Container: ${shipment.containerNumber || "N/A"}`,
      `- Notes: ${shipment.notes || "None"}`,
      "",
      "TIMELINE (most recent first)",
      timeline.length === 0
        ? "No timeline events recorded."
        : timeline
            .slice(0, MAX_TIMELINE_EVENTS)
            .map((event, index) => {
              const details = [
                `${index + 1}. ${formatDate(event.createdAt)} - ${event.eventType || "Event"}`,
                `   Description: ${event.description || "N/A"}`,
                event.location ? `   Location: ${event.location}` : null,
                event.statusBefore || event.statusAfter
                  ? `   Status: ${event.statusBefore || "?"} -> ${event.statusAfter || "?"}`
                  : null,
              ]
                .filter(Boolean)
                .join("\n");
              return details;
            })
            .join("\n"),
      "",
      "Use only the shipment data above. Never invent events, locations or",
      "facts. Assess how likely this shipment is to miss its estimated",
      "arrival, explain why in 1-4 concise reasons, and give 1-4 concrete",
      "actions a dispatcher could take to reduce the delay.",
      `Risk must be one of: ${RISK_LEVELS.join(", ")}.`,
    ];

    return lines.join("\n");
  }

  systemPrompt() {
    return [
      "You are a logistics delay-risk analyst.",
      "Respond with ONLY a valid JSON object in exactly this shape:",
      '{ "risk": "Low" | "Medium" | "High", "confidence": 0.0, "summary": "string", "reasons": ["string"], "recommendations": ["string"] }',
      "confidence must be a number between 0 and 1 inclusive.",
      "reasons and recommendations must be arrays of strings (empty arrays are allowed).",
      "Never add fields beyond the shape above.",
    ].join("\n");
  }
}

module.exports = new DelayRiskPromptBuilder();
module.exports.RISK_LEVELS = RISK_LEVELS;
