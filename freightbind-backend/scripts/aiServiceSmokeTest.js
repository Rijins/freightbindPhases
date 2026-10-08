/**
 * AI service smoke test (dev) — exercises the AI infrastructure end to end
 * with the mock provider: no network, no MongoDB, no API key required.
 *
 * Run: node scripts/aiServiceSmokeTest.js  (inside freightbind-backend/)
 */
const assert = require("assert");
const aiService = require("../services/aiService");
const { getProvider } = require("../services/ai/providers");
const { listBuilders } = require("../services/ai/promptBuilders");

const shipment = {
  referenceNumber: "FB-2026-001",
  status: "In Transit",
  origin: "Chicago, IL",
  destination: "Dallas, TX",
  priority: "High",
  estimatedArrival: "2026-08-08",
  notes: "Fragile, temperature sensitive",
};

(async () => {
  // 1. Provider factory resolves
  const provider = getProvider("mock", {});
  assert.strictEqual(provider.name, "mock", "mock provider should resolve");

  // 2. Prompt builders registered
  assert(listBuilders().includes("shipmentSummary"), "shipmentSummary builder must be registered");

  // 3. Completion through the central service, mock provider, normalized shape
  const result = await aiService.complete({
    feature: "shipment:summary",
    builderName: "shipmentSummary",
    inputs: { shipment },
  });
  assert.strictEqual(result.success, true, "normalized response must carry success:true");
  assert.ok(result.data && typeof result.data === "object", "data must parse into an object (JSON builder)");
  assert.ok(result.meta.feature === "shipment:summary", "meta must carry the feature name");
  assert.ok(result.raw.length > 0, "raw content must be preserved");
  console.log("  ok - completion + normalization");

  // 4. Cache hit: second identical call returns instantly without recompute
  const start = Date.now();
  const cached = await aiService.complete({
    feature: "shipment:summary",
    builderName: "shipmentSummary",
    inputs: { shipment },
  });
  assert.strictEqual(cached.data, result.data, "cached result must equal first result");
  console.log("  ok - cache hit", `(${Date.now() - start}ms)`);

  // 5. JSON mode
  const jsonResult = await aiService.complete({
    feature: "shipment:json",
    builderName: "shipmentSummary",
    inputs: { shipment },
    options: { json: true, skipCache: true },
  });
  assert.strictEqual(jsonResult.data.ok, true, "JSON response must parse into an object");
  console.log("  ok - JSON normalization");

  // 6. safeComplete never throws (unknown builder)
  const failed = await aiService.safeComplete({
    feature: "shipment:missing",
    builderName: "doesNotExist",
    inputs: { shipment },
  });
  assert.strictEqual(failed.success, false, "safeComplete must return success:false on failure");
  assert.ok(failed.error && failed.error.code === "AI_CONFIGURATION_ERROR", "typed error code expected");
  console.log("  ok - safeComplete error envelope");

  // 7. Missing configuration is a handled, typed state (openai without key)
  const { AI_PROVIDERS } = require("../config/ai");
  const bareOpenAi = getProvider(AI_PROVIDERS.OPENAI, { apiKey: "", model: "gpt-4o-mini" });
  await assert.rejects(
    bareOpenAi.complete({ prompt: "hello" }),
    (error) => error.code === "AI_CONFIGURATION_ERROR",
    "openai provider without a key must throw AiConfigurationError"
  );
  console.log("  ok - missing configuration handled");

  console.log(`\nAI service smoke test PASSED (${listBuilders().length} builder(s) registered)`);
  process.exit(0);
})().catch((error) => {
  console.error(`\nAI service smoke test FAILED: ${error.message}`);
  process.exit(1);
});