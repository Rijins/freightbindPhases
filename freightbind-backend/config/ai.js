const dotenv = require("dotenv");
dotenv.config();

const AI_PROVIDERS = Object.freeze({
  OPENAI: "openai",
  MOCK: "mock",
});

const DEFAULT_TIMEOUT_MS = 30000;
const DEFAULT_MAX_RETRIES = 1;
const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1000;
const DEFAULT_CACHE_MAX_ENTRIES = 100;

const aiConfig = Object.freeze({
  provider: process.env.AI_PROVIDER || AI_PROVIDERS.MOCK,
  model: process.env.AI_MODEL || "gpt-4o-mini",
  apiKey: process.env.AI_API_KEY || "",
  baseURL: process.env.AI_BASE_URL || "https://api.openai.com/v1",
  timeoutMs: Number(process.env.AI_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS,
  maxRetries: Number(process.env.AI_MAX_RETRIES) || DEFAULT_MAX_RETRIES,
  cacheTtlMs: Number(process.env.AI_CACHE_TTL_MS) || DEFAULT_CACHE_TTL_MS,
  cacheMaxEntries: Number(process.env.AI_CACHE_MAX_ENTRIES) || DEFAULT_CACHE_MAX_ENTRIES,
});

const isAiConfigured = () =>
  aiConfig.provider === AI_PROVIDERS.OPENAI && Boolean(aiConfig.apiKey);

module.exports = { aiConfig, AI_PROVIDERS, isAiConfigured };
