/**
 * Contract every prompt builder implements. Builders are pure — they only
 * turn structured inputs into a prompt string. They never call providers.
 * Adding a future feature (Delay Risk, Route Suggestions, ETA, Cargo
 * Insights) is just a new builder registered in index.js — no redesign.
 */
class BasePromptBuilder {
  constructor({ name, json = false }) {
    this.name = name;
    this.json = json;
  }

  /**
   * @param {object} inputs structured feature inputs
   * @returns {Promise<string>|string} the final prompt
   */
  build(inputs) {
    throw new Error(`Prompt builder "${this.name}" does not implement build()`);
  }

  /** Optional system prompt layered on top of the generated prompt. */
  systemPrompt(_inputs) {
    return "You are a helpful logistics assistant.";
  }
}

module.exports = BasePromptBuilder;