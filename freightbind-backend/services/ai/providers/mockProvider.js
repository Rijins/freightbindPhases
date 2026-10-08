const BaseProvider = require("./baseProvider");

/**
 * Deterministic provider used when no AI_API_KEY is configured or when
 * AI_PROVIDER=mock. Keeps the application fully functional in development
 * without a real provider and never crashes the server.
 *
 * Supports json:true by echoing back a small valid JSON envelope derived
 * from the prompt hash, so downstream normalization stays testable.
 */
class MockProvider extends BaseProvider {
  constructor(config) {
    super({ name: "mock", config });
  }

  async complete({ prompt, options = {} }) {
    const hash = this._hash(prompt);
    if (options.json === true) {
      const seed = parseInt(hash, 16);
      if (options.feature === "shipment:summary") {
        const status = ["Preparing", "In Transit", "Delivered"][seed % 3];
        const milestones = [
          `${status} - shipment departed its origin checkpoint.`,
          "Freight documentation verified and customs-cleared.",
          "ETA confirmed with the receiving warehouse.",
        ];
        return {
          content: JSON.stringify({
            kind: "mock",
            ok: true,
            requestId: hash,
            message: "Mock AI response — no provider configured.",
            overview: `Shipment is currently ${status.toLowerCase()} and on schedule against its estimated departure and arrival windows.`,
            milestones,
            currentProgress: `Overall progress is approximately ${((seed >> 4) % 60) + 20}% complete based on the latest recorded timeline activity.`,
            concerns: ["No critical issues detected in the current timeline events."],
            nextAction: "Continue monitoring at the next scheduled checkpoint.",
          }),
          usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
          model: this.config.model,
        };
      }
      if (options.feature === "shipment:recommendations") {
        const severities = ["Low", "Medium", "High", "Critical"];
        const titles = [
          "Confirm the route plan",
          "Update the customer ETA",
          "Verify vehicle readiness",
          "Monitor the next checkpoint",
        ];
        const actions = [
          "Review the planned route against current conditions and confirm it with the driver.",
          "Notify the customer about the latest estimated arrival window.",
          "Re-check the vehicle inspection and documentation before the next leg.",
          "Watch the next checkpoint and escalate if the schedule slips further.",
        ];
        const count = 2 + (seed % 3);
        const recommendations = Array.from({ length: count }, (_, index) => ({
          id: `mock-rec-${hash}-${index + 1}`,
          severity: severities[(seed + index * 2) % severities.length],
          title: titles[(seed + index) % titles.length],
          action: actions[(seed + index) % actions.length],
          reason:
            "Derived from the supplied shipment status and recent timeline activity.",
        }));
        return {
          content: JSON.stringify({
            kind: "mock",
            ok: true,
            requestId: hash,
            message: "Mock AI response — no provider configured.",
            recommendations,
          }),
          usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
          model: this.config.model,
        };
      }
      const risk = this._pick(["Low", "Medium", "High"], seed);
      const confidence = Number((0.45 + ((seed >> 4) % 50) / 100).toFixed(2));
      const summary = `The shipment shows ${risk.toLowerCase()} delay risk based on its current status and recent timeline activity.`;
      return {
        content: JSON.stringify({
          kind: "mock",
          ok: true,
          requestId: hash,
          message: "Mock AI response — no provider configured.",
          risk,
          confidence,
          summary,
          reasons: [
            "Status and timeline indicate the shipment is on this trajectory.",
          ],
          recommendations: [
            "Continue tracking the shipment at its next scheduled checkpoint.",
          ],
        }),
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
        model: this.config.model,
      };
    }
    return {
      content: `Mock AI response (${hash}) — no provider configured.`,
      usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      model: this.config.model,
    };
  }

  _pick(values, seed) {
    return values[seed % values.length];
  }

  _hash(input) {
    let hash = 5381;
    for (let i = 0; i < input.length; i += 1) {
      hash = (hash * 33) ^ input.charCodeAt(i);
    }
    return (hash >>> 0).toString(16).slice(0, 8);
  }
}

module.exports = MockProvider;