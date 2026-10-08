/**
 * AI Recommendations smoke test (dev) — exercises the recommendation
 * pipeline end to end with the mock provider: no network, no MongoDB, no
 * API key required.
 *
 * Run: node scripts/recommendationsSmokeTest.js  (inside freightbind-backend/)
 */
const assert = require("assert");
const aiService = require("../services/aiService");
const { listBuilders, getBuilder } = require("../services/ai/promptBuilders");
const {
  normalizeRecommendations,
  FALLBACK_RECOMMENDATIONS,
} = require("../services/aiRecommendationsService");

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
  // 1. Builder registered + prompt contains shipment/timeline context
  assert(listBuilders().includes("recommendations"), "recommendations builder must be registered");
  const builder = getBuilder("recommendations");
  const prompt = builder.build({ shipment, timeline });
  assert.strictEqual(typeof prompt, "string", "build() must return a string");
  assert(prompt.includes("FB-2026-001"), "prompt must include shipment reference");
  assert(prompt.includes("In Transit"), "prompt must include shipment status");
  assert(prompt.includes("Dallas, TX"), "prompt must include destination");
  assert(prompt.includes("Oklahoma City, OK"), "prompt must include current location");
  assert(prompt.includes("Location Updated"), "prompt must include timeline events");
  assert(
    /^.*"recommendations".*"severity".*"title".*"action".*"reason"/s.test(builder.systemPrompt()),
    "system prompt must define the JSON shape"
  );
  console.log("  ok - builder registered + prompt built");

  // 2. Full pipeline through the central AI service (mock provider, JSON mode)
  const result = await aiService.complete({
    feature: "shipment:recommendations",
    builderName: "recommendations",
    inputs: { shipment, timeline },
    options: { json: true, skipCache: true },
  });
  assert.strictEqual(result.success, true, "central service must resolve");
  assert.ok(result.data && typeof result.data === "object", "json must parse into an object");
  assert.ok(Array.isArray(result.data.recommendations), "mock must return a recommendations array");
  assert(result.data.recommendations.length >= 2, "mock must return multiple recommendations");
  console.log("  ok - completion through central AI service (mock provider)");

  // 3. Response normalization — valid shape maps through, shipmentId stamped
  const normalized = normalizeRecommendations(
    {
      recommendations: [
        {
          id: "r1",
          severity: "Critical",
          title: "Re-route the load",
          action: "Switch to the northern corridor",
          reason: "I-35 is closed ahead.",
        },
        {
          id: "r2",
          severity: "Medium",
          title: "Notify the customer",
          action: "Send a revised ETA",
          reason: "",
        },
      ],
    },
    "FB-2026-001"
  );
  assert.strictEqual(normalized.length, 2, "valid entries must pass through");
  assert.strictEqual(normalized[0].severity, "Critical", "severity must pass through");
  assert.strictEqual(normalized[0].action, "Switch to the northern corridor", "action must pass through");
  assert.strictEqual(normalized[0].shipmentId, "FB-2026-001", "shipmentId must be stamped");
  assert.strictEqual(normalized[1].reason, "", "empty reason is allowed");
  console.log("  ok - valid response normalized");

  // 4. Malformed entries rejected; severity clamped; count capped
  const malformed = normalizeRecommendations(
    {
      recommendations: [
        { severity: "Extreme", title: "", action: "no title -> reject" },
        { severity: "High", action: "missing title -> reject" },
        { severity: "High", title: "ok", action: "valid", reason: "x" },
        { severity: "Weird", title: "clamped", action: "severity clamps to Low", reason: "x" },
        "not-an-object",
        42,
        null,
        { severity: "High", title: "capped", action: "should be sliced away" },
      ],
    },
    "FB-X"
  );
  assert.strictEqual(malformed.length, 3, "malformed entries must be rejected");
  assert.strictEqual(malformed[0].title, "ok", "first valid entry survives");
  assert.strictEqual(malformed[1].severity, "Low", "unknown severity must clamp to Low");
  assert.strictEqual(malformed[2].title, "capped", "cap removes entries beyond the limit");
  assert.strictEqual(malformed[2].shipmentId, "FB-X", "shipmentId must be stamped on every entry");
  console.log("  ok - malformed input clamped + rejected safely");

  // 5. Cap enforcement
  const many = normalizeRecommendations(
    {
      recommendations: Array.from({ length: 12 }, (_, i) => ({
        id: `r${i}`,
        severity: "Low",
        title: `T${i}`,
        action: `A${i}`,
        reason: "x",
      })),
    },
    "FB-Y"
  );
  assert.strictEqual(many.length, 6, "recommendations must be capped at 6");
  console.log("  ok - recommendation count capped");

  // 6. Null / garbage / empty input returns safe fallback, never throws
  const fallbackNull = normalizeRecommendations(null, "FB-Z");
  assert.deepStrictEqual(fallbackNull, FALLBACK_RECOMMENDATIONS.map((r) => ({ ...r, shipmentId: "FB-Z" })), "null must return fallback");
  const fallbackGarbage = normalizeRecommendations("nope", "FB-Z");
  assert.strictEqual(fallbackGarbage.length, FALLBACK_RECOMMENDATIONS.length, "non-object must return fallback");
  const fallbackEmpty = normalizeRecommendations({ recommendations: [] }, "FB-Z");
  assert.strictEqual(fallbackEmpty.length, FALLBACK_RECOMMENDATIONS.length, "empty array must return fallback");
  assert.strictEqual(fallbackEmpty[0].shipmentId, "FB-Z", "fallback must carry the shipmentId");
  console.log("  ok - empty/invalid response returns fallback");

  console.log("\nRecommendations smoke test PASSED");
  process.exit(0);
})().catch((error) => {
  console.error(`\nRecommendations smoke test FAILED: ${error.message}`);
  process.exit(1);
});
