import { FiAlertTriangle, FiRefreshCw } from "react-icons/fi";
import SectionHeader from "../../../../components/page/SectionHeader";
import AiInsightCard from "../../../../components/widgets/AiInsightCard";
import AiSummaryCard from "../../../../components/widgets/AiSummaryCard";
import DashboardGrid from "../../../../components/widgets/DashboardGrid";
import AiOverview from "./AiOverview";
import AiRecommendationsPanel from "./AiRecommendationsPanel";

/**
 * AiCommandCenter — AI intelligence panel (Phase 8 Part 4). Composes the
 * live AI Overview stats, the ranked AI Recommendations panel, the top
 * shipment summary card and the per-shipment delay-risk insight grid.
 * Everything is derived from the existing AI hooks — no AI logic here.
 *
 * Phase 9 Part 4: AI failures are never silent — a compact banner surfaces
 * when any analysis slot failed, distinct from a legitimate Low-risk result,
 * with a retry action.
 *
 * Props: insights, loading, shipmentSummary, shipmentSummaryLoading,
 *   shipmentTitle, aiOverview { stats, loading }, aiRecommendations [],
 *   aiRecommendationsLoading, aiRecommendationsError, onRetryRecommendations,
 *   aiError, onRetryAI, onViewShipment.
 */
const AiCommandCenter = ({
  insights = [],
  loading = false,
  shipmentSummary = null,
  shipmentSummaryLoading = false,
  shipmentTitle = "AI Shipment Summary",
  aiOverview = { stats: {}, loading: false },
  aiRecommendations = [],
  aiRecommendationsLoading = false,
  aiRecommendationsError = null,
  onRetryRecommendations,
  aiError = null,
  onRetryAI,
  onViewShipment,
}) => {
  const recommendationsLoading =
    (aiOverview.loading || aiRecommendationsLoading) && aiRecommendations.length === 0;

  return (
    <section aria-labelledby="ai-command-center-title">
      <SectionHeader
        id="ai-command-center-title"
        title="AI Command Center"
        subtitle="Live intelligence on shipments, surfaced from network telemetry."
      />
      <div className="mt-5 space-y-5">
        {aiError && !aiOverview.loading && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-[20px] border border-amber-200 bg-amber-50/80 px-4 py-3 dark:border-amber-500/30 dark:bg-amber-500/10"
          >
            <FiAlertTriangle
              size={18}
              className="mt-0.5 shrink-0 text-amber-500 dark:text-amber-400"
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                AI analysis is temporarily unavailable
              </p>
              <p className="mt-0.5 text-xs text-amber-700/90 dark:text-amber-400/90">
                One or more AI analyses could not be refreshed. Retry to regenerate the
                affected predictions — this is not a low-risk result.
              </p>
            </div>
            {onRetryAI && (
              <button
                type="button"
                onClick={onRetryAI}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-2.5 py-1.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100 dark:border-amber-500/40 dark:bg-zinc-900 dark:text-amber-300 dark:hover:bg-amber-500/10"
              >
                <FiRefreshCw size={12} aria-hidden="true" />
                Retry
              </button>
            )}
          </div>
        )}

        <AiOverview stats={aiOverview.stats} loading={aiOverview.loading} />

        <AiRecommendationsPanel
          recommendations={aiRecommendations}
          loading={recommendationsLoading}
          error={aiRecommendationsError}
          onRetry={onRetryRecommendations}
          onViewShipment={onViewShipment}
        />

        {(shipmentSummary || shipmentSummaryLoading) && (
          <AiSummaryCard
            summary={shipmentSummary}
            loading={shipmentSummaryLoading}
            title={shipmentTitle}
          />
        )}
        <DashboardGrid columns={4}>
          {insights.map((insight) => (
            <AiInsightCard
              key={insight._id}
              insight={insight}
              loading={loading}
              detail={insight.detail}
            />
          ))}
        </DashboardGrid>
      </div>
    </section>
  );
};

export default AiCommandCenter;
