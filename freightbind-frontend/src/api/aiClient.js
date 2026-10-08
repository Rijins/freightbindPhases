import axiosInstance from "./axiosInstance";
import {
  AI_RUN_ENDPOINT,
  AI_DEFAULT_TIMEOUT_MS,
  AI_CACHE_TTL_MS,
  AI_CACHE_MAX_ENTRIES,
} from "../utils/constants";

/**
 * The ONE AI client for the entire app. Built on the shared axiosInstance
 * (so auth + 401 handling stay consistent) with an AI-specific longer
 * timeout, AbortController support, and a performance guard:
 *
 * 1. In-flight dedupe — identical `feature + payload` calls collapse onto
 *    one pending promise (prevents duplicate AI requests).
 * 2. Bounded TTL cache — repeat reads within the TTL never hit the server;
 *    capacity is capped so the cache can't leak memory.
 *
 * No AI logic lives in components — everything goes through this client.
 */
const createAbortError = () =>
  typeof DOMException !== "undefined"
    ? new DOMException("The operation was aborted", "AbortError")
    : new Error("The operation was aborted");

const hash = (value) => {
  let h = 5381;
  const input = typeof value === "string" ? value : JSON.stringify(value ?? {});
  for (let i = 0; i < input.length; i += 1) {
    h = (h * 33) ^ input.charCodeAt(i);
  }
  return (h >>> 0).toString(16);
};

const createKey = (feature, payload) => `${feature}:${hash(payload)}`;

class AiClient {
  constructor() {
    this._inFlight = new Map();
    this._cache = new Map();
    this._timeoutMs = AI_DEFAULT_TIMEOUT_MS;
    this._cacheTtlMs = AI_CACHE_TTL_MS;
    this._cacheMaxEntries = AI_CACHE_MAX_ENTRIES;
  }

  /**
   * Runs an AI request through the shared axios instance.
   * @param {object} params
   * @param {string} params.feature logical feature name (dedupe/cache key)
   * @param {object} [params.payload] inputs sent to the backend feature
   * @param {object} [params.options] { url, timeoutMs, cacheTtlMs, skipCache, skipDedupe, signal }
   */
  requestAi({ feature, payload = {}, options = {} }) {
    const key = createKey(feature, payload);
    const url = options.url || AI_RUN_ENDPOINT;
    const timeoutMs = options.timeoutMs || this._timeoutMs;

    if (options.skipCache !== true) {
      const cached = this._readCache(key);
      if (cached.found) {
        return Promise.resolve(cached.value);
      }
    }

    if (options.skipDedupe !== true) {
      const inFlight = this._inFlight.get(key);
      if (inFlight) {
        // Two separate callers asked for the same thing while it is running —
        // collapse onto the same pending promise.
        if (options.signal) {
          if (options.signal.aborted) return Promise.reject(createAbortError());
          return new Promise((resolve, reject) => {
            const onAbort = () => reject(createAbortError());
            options.signal.addEventListener("abort", onAbort, { once: true });
            inFlight.run.then(
              (value) => {
                options.signal.removeEventListener("abort", onAbort);
                resolve(value);
              },
              (error) => {
                options.signal.removeEventListener("abort", onAbort);
                reject(error);
              }
            );
          });
        }
        return inFlight.run;
      }
    }

    const run = axiosInstance
      .post(url, { feature, payload }, { signal: options.signal, timeout: timeoutMs })
      .then((res) =>
        res && res.data !== undefined ? res.data : { success: true, data: res }
      );

    this._inFlight.set(key, { run, payload });
    run.finally(() => this._inFlight.delete(key)).catch(() => {});

    run.then((value) => {
      // A run invalidated by invalidateFor() (targeted refresh) must never
      // write its stale response into the cache — the fresh re-run owns it.
      if (options.skipCache !== true && !run._invalidated) {
        this._writeCache(key, value, options.cacheTtlMs, payload);
      }
    });

    return run;
  }

  _readCache(key) {
    const entry = this._cache.get(key);
    if (!entry) return { found: false };
    if (Date.now() - entry.createdAt >= entry.ttlMs) {
      this._cache.delete(key);
      return { found: false };
    }
    return { found: true, value: entry.value };
  }

  _writeCache(key, value, ttlMs, payload) {
    if (this._cache.has(key)) this._cache.delete(key);
    this._cache.set(key, {
      value,
      payload,
      createdAt: Date.now(),
      ttlMs: ttlMs || this._cacheTtlMs,
    });
    while (this._cache.size > this._cacheMaxEntries) {
      const oldest = this._cache.keys().next().value;
      if (oldest === undefined) break;
      this._cache.delete(oldest);
    }
  }

  invalidate(feature) {
    for (const key of this._cache.keys()) {
      if (key.startsWith(feature)) this._cache.delete(key);
    }
  }

  /**
   * Evicts cached responses for one feature whose payload matches
   * `payloadMatch` (a shallow subset of the original payload). Used for
   * targeted AI refresh: only the affected shipment's analysis is dropped,
   * every other cached response stays valid.
   * @param {string} feature logical feature name (cache key prefix)
   * @param {object} payloadMatch subset of the original request payload
   */
  invalidateFor(feature, payloadMatch) {
    if (!feature || !payloadMatch) return;
    for (const [key, entry] of this._cache) {
      if (!key.startsWith(feature)) continue;
      const stored = entry?.payload || {};
      const matches = Object.entries(payloadMatch).every(
        ([field, value]) => stored[field] === value
      );
      if (matches) this._cache.delete(key);
    }
    // Mark matching in-flight runs as invalidated so their late resolution
    // cannot re-poison the cache after the fresh re-run has started.
    for (const [key, inflight] of this._inFlight) {
      if (!key.startsWith(feature)) continue;
      const stored = inflight?.payload || {};
      const matches = Object.entries(payloadMatch).every(
        ([field, value]) => stored[field] === value
      );
      if (matches && inflight?.run) inflight.run._invalidated = true;
    }
  }

  clearCache() {
    this._inFlight.clear();
    this._cache.clear();
  }

  getStats() {
    return { inFlight: this._inFlight.size, cached: this._cache.size };
  }
}

const aiClient = new AiClient();

export default aiClient;
export { AiClient };