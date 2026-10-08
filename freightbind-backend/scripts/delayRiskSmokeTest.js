/**
 * Delay Risk smoke test (dev) — exercises the delay prediction pipeline end
 * to end with the mock provider: no network, no MongoDB, no API key required.
 *
 * Run: node scripts/delayRiskSmokeTest.js  (inside freightbind-backend/)
 */
const assert = require("assert");
const aiService = require("../services/aiService");
const { listBuilders, getBuilder } = require("../services/ai/promptBuilders");
const {
  normalizeDelayRiskPrediction,
  FALLBACK_PREDICTION,
} = require("../services/delayRiskService");

const shipment = {
  shipmentId: "FB-2026-001",
  title: "Server rack delivery",
  status: "In Transit",
  priority: "High",
  origin: "Chicago, IL",
  destination: "Dallas, TX",
  currentLocation: "Oklahoma City, OK",
  cargoType: "Electronics",
  shipmentType: "Full Truckload",
  estimatedArrival: "2026-08-08T18:00:00.000Z",
  weight: 4200,
  notes: "Fragile, temperature sensitive",
};

const timeline = [
  {
    eventType: "Location Updated",
    description: "Departed Oklahoma City checkpoint",
    location: "Oklahoma City, OK",
    createdAt: "2026-08-05T09:00:00.000Z",
  },
  {
    eventType: "Status Updated",
    description: "Marked In Transit",
    statusBefore: "Scheduled",
    statusAfter: "In Transit",
    createdAt: "2026-08-05T08:45:00.000Z",
  },
];

(async () => {
  // 1. Builder registered + reusable
  assert(listBuilders().includes("delayRisk"), "delayRisk builder must be registered");
  const builder = getBuilder("delayRisk");
  const prompt = builder.build({ shipment, timeline });
  assert.strictEqual(typeof prompt, "string", "build() must return a string");
  assert(prompt.includes("In Transit"), "prompt must include shipment status");
  assert(prompt.includes("Dallas, TX"), "prompt must include destination");
  assert(prompt.includes("Oklahoma City, OK"), "prompt must include current location");
  assert(prompt.includes("Location Updated"), "prompt must include timeline events");
  assert(/^.*"risk".*"confidence".*"summary".*"reasons".*"recommendations"/s.test(builder.systemPrompt()),
    "system prompt must define the JSON shape");
  console.log("  ok - builder registered + prompt built");

  // 2. Full pipeline through the central AI service (mock provider, JSON mode)
  const result = await aiService.complete({
    feature: "delay:risk",
    builderName: "delayRisk",
    inputs: { shipment, timeline },
    options: { json: true, skipCache: true },
  });
  assert.strictEqual(result.success, true, "central service must resolve");
  assert.ok(result.data && typeof result.data === "object", "json must parse into an object");
  console.log("  ok - completion through central AI service");

  // 3. Response normalization — valid shape maps through
  const prediction = normalizeDelayRiskPrediction({
    risk: "High",
    confidence: 0.87,
    summary: "Weather holds this corridor.",
    reasons: ["Severe weather on I-35", "Late departure"],
    recommendations: ["Re-route via US-75", "Notify the customer"],
  });
  assert.deepStrictEqual(Object.keys(prediction).sort(), [
    "recommendations",
    "reasons",
    "confidence",
    "risk",
    "summary",
  ].sort(), "prediction must carry exactly the expected keys");
  assert.strictEqual(prediction.risk, "High", "risk must pass through");
  assert.strictEqual(prediction.confidence, 0.87, "confidence must pass through");
  console.log("  ok - valid response normalized");

  // 4. Clamping — invalid values degrade to safe defaults, never throw
  const garbage = normalizeDelayRiskPrediction({
    risk: "Extreme",
    confidence: 7,
    summary: "",
    reasons: "not an array",
    recommendations: [42, "ok", "", "ok2", "ok3", "ok4", "ok5"],
  });
  assert.strictEqual(garbage.risk, "Low", "unknown risk must clamp to Low");
  assert.strictEqual(garbage.confidence, 1, "confidence must clamp to 1");
  assert.strictEqual(garbage.summary, FALLBACK_PREDICTION.summary, "empty summary must fall back");
  assert.deepStrictEqual(garbage.reasons, [], "non-array reasons must become []");
  assert.deepStrictEqual(garbage.recommendations, ["ok", "ok2", "ok3", "ok4", "ok5"], "string list must be cleaned + capped");
  assert.strictEqual(garbage.recommendations.length, 5, "recommendations must be capped");
  console.log("  ok - invalid response clamps to safe shape");

  // 5. Null/garbage input never throws
  assert.deepStrictEqual(normalizeDelayRiskPrediction(null), { ...FALLBACK_PREDICTION }, "null must return fallback");
  assert.deepStrictEqual(normalizeDelayRiskPrediction("nope"), { ...FALLBACK_PREDICTION }, "non-object must return fallback");
  console.log("  ok - empty response returns fallback");

  console.log("\nDelay risk smoke test PASSED");
  process.exit(0);
})().catch((error) => {
  console.error(`\nDelay risk smoke test FAILED: ${error.message}`);
  process.exit(1);
});
