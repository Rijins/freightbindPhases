import { motion } from "framer-motion";
import { FiArrowRight, FiTarget, FiAlertTriangle } from "react-icons/fi";
import Badge from "../../../../components/Badges/Badge";
import Skeleton from "../../../../components/Skeleton/Skeleton";
import EmptyState from "../../../../components/EmptyState/EmptyState";
import ErrorState from "../../../../components/ErrorState/ErrorState";
import { useRoleTheme } from "../../../../contexts/RoleThemeContext";
import { cn } from "../../../../utils/cn";
import { EASE } from "../../../../animations";

const SEVERITY_CONFIG = {
  critical: { label: "Critical", badge: "red" },
  high: { label: "High", badge: "amber" },
  medium: { label: "Medium", badge: "blue" },
  low: { label: "Info", badge: "slate" },
};

const severityRank = (severity) =>
  ({ critical: 4, high: 3, medium: 2, low: 1 })[severity] || 0;

const rankRecommendations = (recommendations) =>
  [...(recommendations || [])]
    .filter((r) => r?.text || r?.title)
    .sort((a, b) => {
      const aRank = severityRank(a.severity) * 100 + (Number(a.confidence) || 0);
      const bRank = severityRank(b.severity) * 100 + (Number(b.confidence) || 0);
      return bRank - aRank;
    });

const RecommendationRow = ({ recommendation, emphasized = false, onViewShipment }) => {
  const conf = SEVERITY_CONFIG[recommendation.severity] || SEVERITY_CONFIG.low;
  const action = recommendation.text || recommendation.title;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border px-3 py-2.5",
        emphasized
          ? "border-slate-200 bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800/60"
          : "border-transparent"
      )}
    >
      <div className="min-w-0 flex-1">
        {emphasized && (
          <Badge tone="custom" size="sm" dot className="mb-1 text-purple-600 dark:text-purple-400">
            Highest priority
          </Badge>
        )}
        <p className="truncate text-xs font-semibold text-slate-700 dark:text-slate-300">
          {recommendation.shipmentTitle}
          {recommendation.shipmentId && (
            <span className="ml-1.5 font-normal text-slate-400 dark:text-slate-500">
              {recommendation.shipmentId}
            </span>
          )}
        </p>
        <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">{action}</p>
        {recommendation.reason && (
          <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
            {recommendation.reason}
          </p>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <Badge tone={conf.badge} size="sm" dot>
          {conf.label}
        </Badge>
        {onViewShipment && (
          <button
            type="button"
            onClick={() => onViewShipment(recommendation)}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
          >
            View shipment
            <FiArrowRight size={12} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
};

const LoadingPanel = () => (
  <div
    aria-busy="true"
    className="rounded-[20px] border border-slate-200/80 bg-white p-5 shadow-panel dark:border-zinc-800 dark:bg-zinc-900"
  >
    <div className="flex items-center gap-2">
      <Skeleton className="h-9 w-9 rounded-xl" />
      <Skeleton className="h-4 w-44" />
    </div>
    <div className="mt-4 space-y-3">
      <Skeleton className="h-16 w-full rounded-xl" />
      <Skeleton className="h-12 w-full rounded-xl" />
      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  </div>
);

/**
 * AiRecommendationsPanel — reusable AI recommendation panel (Phase 9 Part 4).
 * Displays real recommendations from POST /api/ai/recommendations/:shipmentId
 * (via useAIRecommendations), ranked by severity. Surfaces the
 * highest-priority recommendation above the next-ranked ones, with shipment
 * identity, severity, the suggested action and reasoning.
 *
 * AI failures are never silent: `error` renders a distinct error state with
 * retry (never confused with a Low-risk result), while loading and empty
 * states stay separate.
 *
 * Props: recommendations [{ id, shipmentTitle, shipmentId, severity,
 *   confidence, text, title, reason }], loading, error, onRetry,
 *   onViewShipment, className.
 */
const AiRecommendationsPanel = ({
  recommendations = [],
  loading = false,
  error = null,
  onRetry,
  onViewShipment,
  className = "",
}) => {
  const roleTheme = useRoleTheme();
  const ranked = rankRecommendations(recommendations);

  if (loading) return <LoadingPanel />;

  const [featured, ...rest] = ranked;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: EASE }}
      className={cn(
        "relative overflow-hidden rounded-[20px] border bg-white p-5 shadow-panel dark:bg-zinc-900",
        className
      )}
    >
      <span
        className={cn("pointer-events-none absolute inset-x-0 top-0 h-1", roleTheme.primary.dot)}
        aria-hidden="true"
      />

      <div className="flex items-center gap-2">
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl",
            roleTheme.primary.softBg,
            roleTheme.primary.softText
          )}
        >
          <FiTarget size={16} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
            AI Recommendations
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ranked actions from live AI analysis
          </p>
        </div>
      </div>

      {error && ranked.length === 0 ? (
        <ErrorState
          icon={FiAlertTriangle}
          title="AI recommendations unavailable"
          description={
            error.message || "The recommendation service could not be reached."
          }
          detail={error.detail}
          onRetry={onRetry}
          retryLabel="Retry recommendations"
          className="mt-2 !px-2 !py-6"
        />
      ) : error ? (
        <div
          role="status"
          className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50/80 px-3 py-2 dark:border-amber-500/30 dark:bg-amber-500/10"
        >
          <p className="text-xs text-amber-700 dark:text-amber-300">
            Showing cached recommendations — the latest refresh failed.
          </p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="shrink-0 text-xs font-medium text-amber-700 underline-offset-2 hover:underline dark:text-amber-300"
            >
              Retry
            </button>
          )}
        </div>
      ) : null}

      {!error && !featured ? (
        <EmptyState
          title="No recommendations yet"
          description="AI analysis is assessing shipments."
          size="sm"
          className="mt-4 !px-2 !py-6"
        />
      ) : (
        <ul className="mt-4 space-y-2">
          {featured && (
            <RecommendationRow
              recommendation={featured}
              emphasized
              onViewShipment={onViewShipment}
            />
          )}
          {rest.slice(0, 3).map((r, index) => (
            <RecommendationRow
              key={`${r.shipmentId || r.mongoId || "s"}:${r.id || index}`}
              recommendation={r}
              onViewShipment={onViewShipment}
            />
          ))}
        </ul>
      )}
    </motion.div>
  );
};

export default AiRecommendationsPanel;
