import useAI from "./useAI";

/**
 * useAIRecommendations — declarative AI recommendations hook for one shipment.
 *
 * Built entirely on the shared AI hooks/client (useAI -> useAIRequest ->
 * aiService -> aiClient), so dedupe, TTL caching, retry, abort-on-unmount,
 * loading / error / success / retry all come from the existing AI
 * infrastructure. No AI logic lives here and no second HTTP client exists.
 *
 * @param {object}  params
 * @param {string}  [params.shipmentId]  Mongo id of the shipment; skipped
 *                                       (no request) while falsy.
 * @param {boolean} [params.autoRun]     run automatically on shipmentId change.
 * @param {any}     [params.refreshKey]  optional dep; a change re-runs the same
 *                                       analysis (caller evicts the AI cache
 *                                       first, e.g. aiService.invalidateFor).
 * @returns {{ data: array|null, loading, error, attempt, retry, reset, abort, run }}
 *          `data` is the normalized recommendations array of
 *          { id, severity, title, action, reason, shipmentId }.
 */
const useAIRecommendations = ({ shipmentId, autoRun = true, refreshKey } = {}) => {
  const ready = Boolean(shipmentId);

  const result = useAI({
    feature: "shipment:recommendations",
    payload: { shipmentId },
    options: {
      url: ready ? `/ai/recommendations/${shipmentId}` : undefined,
      // Refresh runs (triggered by refreshKey) must reach the backend even if
      // an older request for the same shipment is still in flight — the
      // affected analysis is evicted first, so this is never a duplicate.
      skipDedupe: refreshKey !== undefined,
    },
    deps: [shipmentId],
    autoRun: autoRun && ready,
    refreshKey,
  });

  return {
    ...result,
    data: result.data?.recommendations ?? result.data,
  };
};

export default useAIRecommendations;
