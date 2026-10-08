const { AiInvalidResponseError } = require("./errors");

const stripCodeFences = (content) => {
  const trimmed = content.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```\s*$/i);
  return fenced ? fenced[1].trim() : trimmed;
};

const parseJson = (content) => {
  const cleaned = stripCodeFences(content);
  try {
    return JSON.parse(cleaned);
  } catch {
    try {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);
    } catch {
      // fall through to invalid response
    }
  }
  throw new AiInvalidResponseError("AI response is not valid JSON", {
    expected: "valid JSON object",
  });
};

/**
 * Normalizes every raw provider response into one fixed shape:
 * { success, data, meta, raw }. Any malformed content becomes a typed
 * AiInvalidResponseError instead of leaking raw provider text.
 */
const normalizeResponse = (providerRaw, options = {}) => {
  if (!providerRaw || typeof providerRaw.content !== "string") {
    throw new AiInvalidResponseError("AI provider returned an empty payload");
  }

  const rawContent = providerRaw.content.trim();
  if (!rawContent) {
    throw new AiInvalidResponseError("AI provider returned empty content");
  }

  let data = rawContent;
  if (options.json === true) {
    data = parseJson(rawContent);
  } else if (options.json === "try") {
    try {
      data = parseJson(rawContent);
    } catch {
      data = rawContent;
    }
  }

  return {
    success: true,
    data,
    meta: {
      model: providerRaw.model || null,
      usage: providerRaw.usage || null,
      feature: options.feature || null,
      generatedAt: new Date().toISOString(),
    },
    raw: rawContent,
  };
};

module.exports = { normalizeResponse, stripCodeFences, parseJson };