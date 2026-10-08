const { AiTimeoutError, AiProviderError } = require("../errors");

/**
 * Contract every AI provider must implement.
 * Providers are transport-only: they never build prompts and never
 * normalize output — that is the prompt builder and normalizer's job.
 */
class BaseProvider {
  constructor({ name, config }) {
    this.name = name;
    this.config = config;
  }

  /**
   * Sends a completion request to the provider.
   * @param {{ prompt: string, options?: object }} payload
   * @returns {Promise<{ content: string, usage?: object, model?: string }>}
   */
  async complete({ prompt, options = {} }) {
    throw new AiProviderError(`Provider "${this.name}" does not implement complete()`, {
      provider: this.name,
    });
  }

  /**
   * Runs a request with a hard timeout and retries, mapping transport
   * failures to typed AI errors so the caller never sees raw fetch errors.
   */
  async withTimeoutAndRetry(handler, { timeoutMs, maxRetries } = {}) {
    const timeout = timeoutMs || this.config.timeoutMs;
    const retries = maxRetries ?? this.config.maxRetries;

    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        return await this._withTimeout(handler, timeout);
      } catch (error) {
        if (error instanceof AiTimeoutError || error instanceof AiProviderError) {
          if (attempt < retries) {
            const delayMs = 250 * 2 ** attempt;
            await new Promise((resolve) => setTimeout(resolve, delayMs));
            continue;
          }
          throw error;
        }
        throw error;
      }
    }
    throw new AiProviderError(`Provider "${this.name}" request failed`, {
      provider: this.name,
    });
  }

  async _withTimeout(handler, timeoutMs) {
    let timer = null;
    try {
      return await Promise.race([
        handler(),
        new Promise((_, reject) => {
          timer = setTimeout(() => {
            reject(
              new AiTimeoutError(`AI provider "${this.name}" timed out after ${timeoutMs}ms`, {
                provider: this.name,
                timeoutMs,
              })
            );
          }, timeoutMs);
        }),
      ]);
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  /**
   * Maps a transport error (fetch/network) into a typed provider error.
   * Overridable per provider to keep HTTP-specific status codes.
   */
  mapTransportError(error, provider = this.name) {
    if (error instanceof AiTimeoutError || error instanceof AiProviderError) {
      return error;
    }
    return new AiProviderError(`AI provider "${provider}" request failed: ${error.message}`, {
      provider,
      cause: error.message,
    });
  }
}

module.exports = BaseProvider;
