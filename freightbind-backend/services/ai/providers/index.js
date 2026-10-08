const OpenAIProvider = require("./openaiProvider");
const MockProvider = require("./mockProvider");
const { AI_PROVIDERS } = require("../../../config/ai");

const PROVIDER_FACTORIES = {
  [AI_PROVIDERS.OPENAI]: (config) => new OpenAIProvider(config),
  [AI_PROVIDERS.MOCK]: (config) => new MockProvider(config),
};

const getProvider = (providerName, config) => {
  const name = providerName || AI_PROVIDERS.MOCK;
  const factory = PROVIDER_FACTORIES[name];
  if (!factory) {
    throw new Error(`Unknown AI provider "${name}". Supported: ${Object.keys(PROVIDER_FACTORIES).join(", ")}`);
  }
  return factory(config);
};

module.exports = { getProvider, PROVIDER_FACTORIES };
