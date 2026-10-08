import { useEffect } from "react";
import useAIRequest from "./useAIRequest";

/**
 * Declarative AI hook built on useAIRequest. Runs automatically on mount and
 * whenever the provided deps change; exposes the same loading / success /
 * error / retry surface so components never contain AI logic.
 *
 * `refreshKey` is an optional extra dep for targeted re-runs: bumping it
 * re-executes the same feature/payload (callers are expected to evict the
 * shared AI client's cached response first, e.g. aiService.invalidateFor).
 */
const useAI = ({ feature, payload = {}, options = {}, deps = [], autoRun = true, refreshKey }) => {
  const hook = useAIRequest({ feature, payload, options });

  useEffect(() => {
    if (!autoRun) return;
    hook.execute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feature, refreshKey, ...deps, autoRun]);

  return {
    ...hook,
    // If autoRun is disabled, the caller drives execution via hook.execute().
    run: hook.execute,
  };
};

export default useAI;