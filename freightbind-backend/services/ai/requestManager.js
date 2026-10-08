/**
 * Performance guard for AI requests.
 *
 * 1. In-flight dedupe — identical concurrent calls collapse onto one
 *    pending promise (prevents duplicate AI requests / duplicate cost).
 * 2. Bounded TTL cache — repeat reads within the TTL hit the cache
 *    instead of the provider; capacity is capped so the cache can never
 *    grow into a memory leak.
 */
class RequestManager {
  constructor({ ttlMs = 5 * 60 * 1000, maxEntries = 100 } = {}) {
    this.ttlMs = ttlMs;
    this.maxEntries = maxEntries;
    this._inFlight = new Map();
    this._cache = new Map();
  }

  static hash(value) {
    let hash = 5381;
    const input = typeof value === "string" ? value : JSON.stringify(value);
    for (let i = 0; i < input.length; i += 1) {
      hash = (hash * 33) ^ input.charCodeAt(i);
    }
    return (hash >>> 0).toString(16);
  }

  static createKey(feature, payload) {
    return `${feature}:${RequestManager.hash(payload || {})}`;
  }

  /**
   * Returns a promise: dedupe -> cache -> compute. If two callers ask for
   * the same key while the first is still running, both get the SAME
   * promise. Successful results are cached under the key for ttlMs.
   */
  getOrCompute(key, compute, { ttlMs } = {}) {
    if (this._inFlight.has(key)) {
      return this._inFlight.get(key);
    }

    const cached = this._readCache(key);
    if (cached.found) {
      return Promise.resolve(cached.value);
    }

    const run = compute().then(
      (value) => {
        this._writeCache(key, value, ttlMs);
        return value;
      },
      (error) => {
        throw error;
      }
    );

    this._inFlight.set(key, run);
    run.finally(() => this._inFlight.delete(key)).catch(() => {});
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

  _writeCache(key, value, ttlMs) {
    if (this._cache.has(key)) {
      this._cache.delete(key);
    }
    this._cache.set(key, {
      value,
      createdAt: Date.now(),
      ttlMs: ttlMs || this.ttlMs,
    });
    while (this._cache.size > this.maxEntries) {
      const oldestKey = this._cache.keys().next().value;
      if (oldestKey === undefined) break;
      this._cache.delete(oldestKey);
    }
  }

  /**
   * Invalidates cached entries whose key starts with the given prefix
   * (typically a feature name). In-flight promises are left alone.
   */
  invalidatePrefix(prefix) {
    for (const key of this._cache.keys()) {
      if (key.startsWith(prefix)) {
        this._cache.delete(key);
      }
    }
  }

  clear() {
    this._inFlight.clear();
    this._cache.clear();
  }

  getStats() {
    return { inFlight: this._inFlight.size, cached: this._cache.size };
  }
}

module.exports = RequestManager;