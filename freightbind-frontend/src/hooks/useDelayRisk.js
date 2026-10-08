import useAI from "./useAI";

/**
 * useDelayRisk — declarative delay-risk prediction hook for one shipment.
 *
 * Built entirely on the shared AI hooks/client (useAI -> useAIRequest ->
 * aiService -> aiClient), so dedupe, TTL caching, retry, abort-on-unmount,
 * loading / error / success / retry all come from the existing AI
 * infrastructure. No AI logic lives here.
 *
 * @param {object}  params
 * @param {string}  [params.shipmentId]  Mongo id of the shipment to predict;
 *                                       skipped (no request) while falsy.
 * @param {boolean} [params.autoRun]     run automatically on shipmentId change.
 * @param {any}     [params.refreshKey]  optional dep; a change re-runs the same
 *                                       prediction (caller evicts the AI cache
 *                                       first, e.g. aiService.invalidateFor).
 * @returns {{ data: object|null, loading, error, attempt, retry, reset, abort, run }}
 *          `data` is the normalized { risk, confidence, summary, reasons,
 *          recommendations } prediction.
 */
const useDelayRisk = ({ shipmentId, autoRun = true, refreshKey } = {}) => {
  const ready = Boolean(shipmentId);

  const result = useAI({
    feature: "delay:risk",
    payload: { shipmentId },
    options: {
      url: ready ? `/ai/delay-risk/${shipmentId}` : undefined,
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
    data: result.data?.prediction ?? result.data,
  };
};

export default useDelayRisk;
