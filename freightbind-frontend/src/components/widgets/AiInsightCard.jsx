import { motion } from "framer-motion";
import { FiArrowRight, FiZap } from "react-icons/fi";
import Badge from "../Badges/Badge";
import ProgressCircular from "../Progress/ProgressCircular";
import Skeleton from "../Skeleton/Skeleton";
import { useRoleTheme } from "../../contexts/RoleThemeContext";
import { cn } from "../../utils/cn";
import { EASE } from "../../animations";

const SEVERITY_CONFIG = {
  critical: { label: "Critical", badge: "red" },
  high: { label: "High", badge: "amber" },
  medium: { label: "Medium", badge: "blue" },
  low: { label: "Info", badge: "slate" },
};

/**
 * AiInsightCard — one AI-generated recommendation with severity, short
 * rationale, a suggested action and a confidence ring. The decorative ring is
 * role-themed; severity reads via the badge.
 *
 * Props: insight, loading, onApply, className.
 * insight: { _id, title, summary?, recommendation, severity, confidence }
 */
const AiInsightCard = ({ insight, loading = false, onApply, className = "" }) => {
  const roleTheme = useRoleTheme();

  if (loading) {
    return (
      <div
        aria-busy="true"
        className={cn(
          "rounded-[20px] border border-slate-200/80 bg-white p-5 shadow-panel dark:border-zinc-800 dark:bg-zinc-900",
          className
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <Skeleton className="mt-4 h-3 w-full" />
        <Skeleton className="mt-2 h-3 w-3/4" />
        <div className="mt-4 flex items-end gap-3">
          <Skeleton className="h-11 w-11 rounded-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      </div>
    );
  }

  if (!insight) return null;

  const i = insight;
  const conf = SEVERITY_CONFIG[i.severity] || SEVERITY_CONFIG.low;
  const confidence = Math.min(100, Math.max(0, Math.round(Number(i.confidence) || 0)));

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

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl",
              roleTheme.primary.softBg,
              roleTheme.primary.softText
            )}
          >
            <FiZap size={16} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{i.title}</p>
            {i.severity && <Badge tone={conf.badge} size="sm" dot>
              {conf.label}
            </Badge>}
          </div>
        </div>
        <ProgressCircular value={confidence} size="sm" trackClassName="stroke-slate-100 dark:stroke-zinc-800" />
      </div>

      {i.summary && (
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{i.summary}</p>
      )}

      {i.recommendation && (
        <button
          type="button"
          onClick={onApply}
          disabled={!onApply}
          className={cn(
            "mt-4 flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-left text-sm transition-colors dark:border-zinc-800 dark:bg-zinc-800/60",
            onApply &&
              "cursor-pointer hover:border-slate-300 hover:bg-slate-100 dark:hover:border-zinc-700 dark:hover:bg-zinc-800"
          )}
        >
          <span className="flex min-w-0 items-center gap-2">
            <FiArrowRight size={14} className="shrink-0 text-slate-400 dark:text-slate-500" aria-hidden="true" />
            <span className="truncate text-slate-700 dark:text-slate-300">{i.recommendation}</span>
          </span>
        </button>
      )}
    </motion.div>
  );
};

export default AiInsightCard;