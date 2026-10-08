const { aiConfig } = require("../config/ai");
const { getProvider } = require("./ai/providers");
const { getBuilder } = require("./ai/promptBuilders");
const { normalizeResponse } = require("./ai/normalizer");
const RequestManager = require("./ai/requestManager");
const { AiError, AiConfigurationError, AiTimeoutError, AiProviderError } = require("./ai/errors");

/**
 * Central AI service — the ONLY public API for any AI work in this app.
 * Controllers, routes, or future features must never touch a provider,
 * builder, or normalizer directly; everything flows through here.
 *
 * Responsibilities: resolve provider + builder, call the provider, normalize
 * every response, dedupe/cache, and translate every failure into a typed
 * AiError so the server never crashes and callers always get a safe shape.
 */
class AiService {
  constructor(config) {
    this.config = config;
    this.manager = new RequestManager({
      ttlMs: config.cacheTtlMs,
      maxEntries: config.cacheMaxEntries,
    });
  }

  /**
   * Runs an AI completion. Resolves the normalized response
   * { success, data, meta, raw } or throws a typed AiError subclass.
   *
   * @param {object} params
   * @param {string}  params.feature       logical name keying dedupe/cache, e.g. "shipment:summary"
   * @param {string}  params.builderName   registered prompt builder name
   * @param {object}  [params.inputs]      inputs passed to the prompt builder
   * @param {object}  [params.options]     json / systemPrompt / temperature / timeoutMs / maxRetries / skipCache
   */
  async complete({ feature, builderName, inputs = {}, options = {} }) {
    if (!feature) {
      throw new AiConfigurationError("AI request requires a feature name", {
        expected: "feature",
      });
    }

    let provider;
    let builder;
    try {
      provider = getProvider(this.config.provider, this.config);
      builder = getBuilder(builderName);
    } catch (error) {
      throw new AiConfigurationError(`AI request misconfigured: ${error.message}`, {
        feature,
        cause: error.message,
      });
    }
    const prompt = await builder.build(inputs);

    const json = options.json ?? builder.json ?? false;
    const run = () =>
      provider
        .complete({
          prompt,
          options: {
            ...options,
            feature,
            json,
            systemPrompt: options.systemPrompt || builder.systemPrompt(inputs),
          },
        })
        .then((providerRaw) => normalizeResponse(providerRaw, { json, feature }));

    if (options.skipCache === true) {
      return run();
    }

    const key = RequestManager.createKey(feature, {
      builderName,
      inputs,
      json,
      model: options.model || null,
    });

    try {
      return await this.manager.getOrCompute(key, run, {
        ttlMs: options.cacheTtlMs,
      });
    } catch (error) {
      throw this._wrapError(error, feature);
    }
  }

  /**
   * Safe variant: never throws — returns a normalized envelope on both
   * paths for callers that prefer not to try/catch.
   */
  async safeComplete(params) {
    try {
      const result = await this.complete(params);
      return { success: true, data: result.data, meta: result.meta, error: null };
    } catch (error) {
      const wrapped = this._wrapError(error, params.feature);
      return {
        success: false,
        message: wrapped.message,
        data: null,
        meta: { code: wrapped.code, feature: params.feature },
        error: wrapped,
      };
    }
  }

  invalidate(feature) {
    this.manager.invalidatePrefix(feature);
  }

  clearCache() {
    this.manager.clear();
  }

  getStats() {
    return this.manager.getStats();
  }

  _wrapError(error, feature) {
    if (error instanceof AiError) {
      return error;
    }
    if (error && /timeout/i.test(error.message || "")) {
      return new AiTimeoutError(undefined, { feature });
    }
    return new AiProviderError(`AI request failed for feature "${feature}": ${error.message}`, {
      feature,
      cause: error.message,
    });
  }
}

const aiService = new AiService(aiConfig);

module.exports = aiService;
module.exports.AiService = AiService;