const BaseProvider = require("./baseProvider");
const { AiConfigurationError, AiProviderError } = require("../errors");

/**
 * OpenAI-compatible REST provider built on Node's global fetch.
 * No SDK dependency; any OpenAI-compatible base URL works
 * (Azure, local models, OpenRouter, etc.).
 */
class OpenAIProvider extends BaseProvider {
  constructor(config) {
    super({ name: "openai", config });
  }

  async complete({ prompt, options = {} }) {
    if (!this.config.apiKey) {
      throw new AiConfigurationError(
        "AI provider is not configured: AI_API_KEY is missing",
        { provider: this.name }
      );
    }

    const url = `${this.config.baseURL.replace(/\/+$/, "")}/chat/completions`;

    const body = {
      model: options.model || this.config.model,
      messages: [
        {
          role: "system",
          content: options.systemPrompt || "You are a helpful logistics assistant.",
        },
        { role: "user", content: prompt },
      ],
      temperature: options.temperature ?? 0.2,
    };

    if (options.json === true) {
      body.response_format = { type: "json_object" };
    }
    if (options.maxTokens) body.max_tokens = options.maxTokens;

    const run = async () => {
      let response;
      try {
        response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.config.apiKey}`,
          },
          body: JSON.stringify(body),
          signal: undefined,
        });
      } catch (error) {
        throw this.mapTransportError(error);
      }

      if (!response.ok) {
        let providerMessage = `HTTP ${response.status}`;
        try {
          const payload = await response.json();
          if (payload?.error?.message) providerMessage = payload.error.message;
        } catch {
          // ignore body parse failures; fall back to status message
        }
        throw new AiProviderError(
          `AI provider returned ${response.status}: ${providerMessage}`,
          { provider: this.name, status: response.status }
        );
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;
      if (typeof content !== "string" || content.trim() === "") {
        throw new AiProviderError("AI provider returned an empty completion", {
          provider: this.name,
        });
      }
      return {
        content,
        usage: data.usage || null,
        model: data.model || this.config.model,
      };
    };

    return this.withTimeoutAndRetry(run, {
      timeoutMs: options.timeoutMs,
      maxRetries: options.maxRetries,
    });
  }
}

module.exports = OpenAIProvider;