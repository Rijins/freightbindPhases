const BasePromptBuilder = require("./basePromptBuilder");

const MAX_TIMELINE_EVENTS = 15;

const formatDate = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toISOString().slice(0, 19).replace("T", " ");
};

const safeText = (value) => (typeof value === "string" && value.trim() !== "" ? value.trim() : "N/A");

class ShipmentSummaryPromptBuilder extends BasePromptBuilder {
  constructor() {
    super({ name: "shipmentSummary", json: true });
  }

  build(inputs) {
    const shipment = inputs.shipment || {};
    const timeline = Array.isArray(inputs.timeline) ? inputs.timeline : [];

    const dispatcher = shipment.assignedDispatcher;
    const dispatcherName =
      safeText(dispatcher?.fullName) !== "N/A"
        ? `${dispatcher.fullName}${dispatcher.role ? ` (${dispatcher.role})` : ""}`
        : "Not assigned";

    const latestEvent = timeline[0];
    const progress = [
      `- Status: ${safeText(shipment.status)}`,
      `- Timeline events recorded: ${timeline.length}`,
      latestEvent
        ? `- Latest event: ${formatDate(latestEvent.createdAt)} - ${safeText(latestEvent.eventType)}`
        : "- Latest event: none recorded",
      `- Estimated departure: ${formatDate(shipment.estimatedDeparture)}`,
      `- Estimated arrival: ${formatDate(shipment.estimatedArrival)}`,
      `- Actual departure: ${formatDate(shipment.actualDeparture)}`,
      `- Actual arrival: ${formatDate(shipment.actualArrival)}`,
    ].join("\n");

    const lines = [
      "Summarize the current state of the following shipment.",
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
      `- Dispatcher: ${dispatcherName}`,
      `- Cargo type: ${safeText(shipment.cargoType)}`,
      `- Vehicle: ${safeText(shipment.vehicleNumber)}`,
      `- Container: ${safeText(shipment.containerNumber)}`,
      `- Weight (kg): ${shipment.weight ?? "N/A"}`,
      `- Notes: ${safeText(shipment.notes)}`,
      "",
      "DELIVERY PROGRESS",
      progress,
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
      "Use only the shipment data above. Never invent events, locations, dates or facts.",
    ];

    return lines.join("\n");
  }

  systemPrompt() {
    return [
      "You are a logistics shipment analyst.",
      'Respond with ONLY a valid JSON object in exactly this shape:',
      '{ "overview": "string", "milestones": ["string"], "currentProgress": "string", "concerns": ["string"], "nextAction": "string" }',
      "overview, currentProgress and nextAction must be non-empty concise strings.",
      "milestones and concerns must be arrays of strings (empty arrays are allowed).",
      "Never add fields beyond the shape above.",
    ].join("\n");
  }
}

module.exports = new ShipmentSummaryPromptBuilder();
