import { motion } from "framer-motion";
import { FiAlertTriangle, FiArrowRight, FiCheckCircle, FiClipboard } from "react-icons/fi";
import Badge from "../Badges/Badge";
import Skeleton from "../Skeleton/Skeleton";
import { useRoleTheme } from "../../contexts/RoleThemeContext";
import { cn } from "../../utils/cn";
import { EASE } from "../../animations";

const SectionLabel = ({ children }) => (
  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
    {children}
  </p>
);

/**
 * AiSummaryCard — AI shipment summary card. Mirrors the AiInsightCard card
 * layout (same shell, role-theme accent bar, skeleton loading) and renders
 * the normalized { overview, milestones, currentProgress, concerns,
 * nextAction } summary.
 *
 * Props: summary, title, loading, className.
 */
const AiSummaryCard = ({ summary, title = "AI Shipment Summary", loading = false, className = "" }) => {
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
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="mt-4 h-3 w-full" />
        <Skeleton className="mt-2 h-3 w-5/6" />
        <Skeleton className="mt-4 h-3 w-2/3" />
        <Skeleton className="mt-2 h-3 w-1/2" />
      </div>
    );
  }

  if (!summary) return null;

  const s = summary;

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
          <FiClipboard size={16} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
          <Badge tone="slate" size="sm" dot>
            Summary
          </Badge>
        </div>
      </div>

      {s.overview && <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{s.overview}</p>}

      {Array.isArray(s.milestones) && s.milestones.length > 0 && (
        <div className="mt-4">
          <SectionLabel>Key milestones</SectionLabel>
          <ul className="mt-2 space-y-1.5">
            {s.milestones.map((milestone, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                <FiCheckCircle size={14} className="mt-0.5 shrink-0 text-emerald-500" aria-hidden="true" />
                <span className="min-w-0">{milestone}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {s.currentProgress && (
        <div className="mt-4">
          <SectionLabel>Current progress</SectionLabel>
          <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">{s.currentProgress}</p>
        </div>
      )}

      {Array.isArray(s.concerns) && s.concerns.length > 0 && (
        <div className="mt-4">
          <SectionLabel>Potential concerns</SectionLabel>
          <ul className="mt-2 space-y-1.5">
            {s.concerns.map((concern, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                <FiAlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-500" aria-hidden="true" />
                <span className="min-w-0">{concern}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {s.nextAction && (
        <div className="mt-4 flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-left text-sm dark:border-zinc-800 dark:bg-zinc-800/60">
          <span className="flex min-w-0 items-center gap-2">
            <FiArrowRight size={14} className="shrink-0 text-slate-400 dark:text-slate-500" aria-hidden="true" />
            <span className="truncate text-slate-700 dark:text-slate-300">{s.nextAction}</span>
          </span>
        </div>
      )}
    </motion.div>
  );
};

export default AiSummaryCard;