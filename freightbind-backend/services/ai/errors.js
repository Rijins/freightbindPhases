const AI_ERROR_CODES = Object.freeze({
  CONFIGURATION: "AI_CONFIGURATION_ERROR",
  TIMEOUT: "AI_TIMEOUT_ERROR",
  PROVIDER: "AI_PROVIDER_ERROR",
  INVALID_RESPONSE: "AI_INVALID_RESPONSE_ERROR",
});

class AiError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = "AiError";
    this.code = code;
    this.statusCode = details.statusCode || 502;
    this.isOperational = true;
    this.details = details;
  }
}

class AiConfigurationError extends AiError {
  constructor(message, details = {}) {
    super(AI_ERROR_CODES.CONFIGURATION, message, { ...details, statusCode: 503 });
    this.name = "AiConfigurationError";
  }
}

class AiTimeoutError extends AiError {
  constructor(message = "AI provider request timed out", details = {}) {
    super(AI_ERROR_CODES.TIMEOUT, message, details);
    this.name = "AiTimeoutError";
  }
}

class AiProviderError extends AiError {
  constructor(message, details = {}) {
    super(AI_ERROR_CODES.PROVIDER, message, details);
    this.name = "AiProviderError";
  }
}

class AiInvalidResponseError extends AiError {
  constructor(message = "AI provider returned an invalid response", details = {}) {
    super(AI_ERROR_CODES.INVALID_RESPONSE, message, { ...details, statusCode: 502 });
    this.name = "AiInvalidResponseError";
  }
}

module.exports = {
  AI_ERROR_CODES,
  AiError,
  AiConfigurationError,
  AiTimeoutError,
  AiProviderError,
  AiInvalidResponseError,
};
