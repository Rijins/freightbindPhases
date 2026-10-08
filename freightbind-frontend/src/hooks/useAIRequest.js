import { useCallback, useEffect, useRef, useState } from "react";
import aiService from "../services/aiService";
import { parseApiError } from "../utils/helpers";

/**
 * Imperative AI request hook. No AI logic lives in components — this hook
 * owns loading / success / error / retry / reset / abort for one AI call.
 *
 * Memory-safety guarantees:
 * - Aborts the in-flight request on unmount (AbortController).
 * - Ignores stale resolutions after unmount (no setState after unmount).
 * - The underlying aiService/aiClient dedupe identical concurrent requests
 *   and bound the cache, so repeated calls can't leak or duplicate work.
 */
const useAIRequest = ({ feature, payload = {}, options = {} } = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  const abortRef = useRef(null);
  const mountedRef = useRef(true);
  const runIdRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
      abortRef.current = null;
    };
  }, []);

  const execute = useCallback(
    async (requestPayload, requestOptions) => {
      const currentPayload = requestPayload ?? payload;
      const currentOptions = requestOptions ?? options;
      const runId = ++runIdRef.current;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        const result = await aiService.requestAi({
          feature,
          payload: currentPayload,
          options: { ...currentOptions, signal: controller.signal },
        });
        if (!mountedRef.current || runId !== runIdRef.current) return null;
        setData(result.data);
        setLoading(false);
        return result;
      } catch (err) {
        if (!mountedRef.current || runId !== runIdRef.current) return null;
        setError(parseApiError(err));
        setData(null);
        setLoading(false);
        return null;
      } finally {
        if (runId === runIdRef.current) {
          abortRef.current = null;
        }
      }
    },
    [feature, payload, options]
  );

  const retry = useCallback(() => {
    setAttempt((count) => count + 1);
    return execute();
  }, [execute]);

  const abort = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    if (mountedRef.current) setLoading(false);
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    if (!mountedRef.current) return;
    setData(null);
    setError(null);
    setLoading(false);
    runIdRef.current += 1;
  }, []);

  return { data, loading, error, attempt, execute, retry, abort, reset };
};

export default useAIRequest;