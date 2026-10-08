import aiClient from "../api/aiClient";
import { AI_MAX_RETRIES } from "../utils/constants";

/**
 * Frontend gateway for every AI call. Components and hooks must never call
 * aiClient or axios directly — always go through aiService.requestAi.
 *
 * Adds retry (network / timeout / 5xx only) on top of the shared AI client's
 * dedupe + cache. Envelope-aware: returns a stable { success, data, message,
 * errors } shape no matter what the backend returns.
 */
const isRetryable = (error) => {
  if (!error) return false;
  if (error.code === "ERR_CANCELED" || error.name === "AbortError") return false;
  const status = error?.response?.status;
  if (status === undefined) return true; // network / timeout
  return status >= 500;
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const normalizeResponse = (envelope) => {
  if (!envelope) return { success: false, data: null, message: "Empty AI response", errors: [] };
  if (envelope.success === false) {
    return { success: false, data: envelope.data ?? null, message: envelope.message, errors: envelope.errors || [] };
  }
  return { success: true, data: envelope.data ?? null, message: envelope.message || "", errors: [] };
};

/**
 * @param {object} params
 * @param {string}  params.feature   logical feature name (dedupe/cache key)
 * @param {object}  params.payload   inputs for the backend feature
 * @param {object}  [params.options] { url, timeoutMs, cacheTtlMs, skipCache, signal, maxRetries }
 */
const requestAi = async ({ feature, payload = {}, options = {} }) => {
  const maxRetries = options.maxRetries ?? AI_MAX_RETRIES;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      const envelope = await aiClient.requestAi({ feature, payload, options });
      return normalizeResponse(envelope);
    } catch (error) {
      if (!isRetryable(error) || attempt >= maxRetries) {
        throw error;
      }
      await delay(250 * 2 ** attempt);
    }
  }
  throw new Error("AI request failed");
};

const invalidate = (feature) => aiClient.invalidate(feature);
const invalidateFor = (feature, payloadMatch) => aiClient.invalidateFor(feature, payloadMatch);
const clearCache = () => aiClient.clearCache();
const getStats = () => aiClient.getStats();

const aiService = { requestAi, invalidate, invalidateFor, clearCache, getStats };

export default aiService;