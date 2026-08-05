/**
 * Merges class names, dropping falsy values and flattening nested arrays.
 * Keeps the design system on one no-dependency utility instead of inline
 * template strings scattered across components.
 */
export const cn = (...classes) =>
  classes.flat().filter(Boolean).join(" ");