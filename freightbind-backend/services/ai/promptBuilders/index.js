const shipmentSummary = require("./shipmentSummary");
const delayRisk = require("./delayRisk");
const recommendations = require("./recommendations");

const BUILDER_REGISTRY = new Map();

const registerBuilder = (builder) => {
  if (!builder || typeof builder.build !== "function") {
    throw new Error("Prompt builder must expose a build() method");
  }
  if (BUILDER_REGISTRY.has(builder.name)) {
    throw new Error(`Prompt builder "${builder.name}" is already registered`);
  }
  BUILDER_REGISTRY.set(builder.name, builder);
  return builder;
};

const getBuilder = (name) => {
  const builder = BUILDER_REGISTRY.get(name);
  if (!builder) {
    throw new Error(`Unknown prompt builder "${name}". Registered: ${[...BUILDER_REGISTRY.keys()].join(", ")}`);
  }
  return builder;
};

const listBuilders = () => [...BUILDER_REGISTRY.keys()];

registerBuilder(shipmentSummary);
registerBuilder(delayRisk);
registerBuilder(recommendations);

module.exports = { registerBuilder, getBuilder, listBuilders };