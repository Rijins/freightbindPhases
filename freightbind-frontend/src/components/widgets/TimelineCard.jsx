import { motion } from "framer-motion";
import { FiCheckCircle, FiClock } from "react-icons/fi";
import Card, { CardHeader } from "../Card/Card";
import Skeleton from "../Skeleton/Skeleton";
import Badge from "../Badges/Badge";
import EmptyState from "../EmptyState/EmptyState";
import { cn } from "../../utils/cn";
import { fadeInUp, staggerContainer } from "../../animations";

const STEP_TONES = {
  completed: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30",
  current: "bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border-amber-300 dark:border-amber-500/30",
  pending: "bg-slate-100 text-slate-400 dark:bg-zinc-800 dark:text-slate-500 border-slate-200 dark:border-zinc-700",
};

/**
 * TimelineCard — vertical progress timeline with connectors and a highlighted
 * current step. Feed it backend timeline events; this card only decides how
 * they are laid out.
 *
 * Props: steps, currentStepId, loading, title, subtitle, emptyTitle,
 *   emptyDescription, className.
 * steps: { id, title, description?, timestamp, tone?, badge? }
 */
const TimelineCard = ({
  steps = [],
  currentStepId,
  loading = false,
  title = "Timeline",
  subtitle,
  emptyTitle = "No events yet",
  emptyDescription = "Timeline events will appear as the shipment moves.",
  className = "",
}) => {
  const isCurrent = (step, index) =>
    currentStepId !== undefined
      ? step.id === currentStepId
      : index === steps.findIndex((s) => s.status === "current");

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader title={title} subtitle={subtitle} />

      {loading ? (
        <div className="space-y-4" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-6 w-6 shrink-0 rounded-full" />
              <div className="w-full space-y-2">
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : steps.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} size="sm" />
      ) : (
        <motion.ol
          variants={staggerContainer(0.05)}
          initial="hidden"
          animate="visible"
          className="relative"
        >
          {steps.map((step, index) => {
            const current = isCurrent(step, index);
            const completed = step.status === "completed";
            return (
              <motion.li
                key={step.id}
                variants={fadeInUp}
                className="relative flex gap-3 pb-5 last:pb-0"
              >
                {index < steps.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute left-[11px] top-7 h-[calc(100%-1.75rem)] w-0.5 bg-slate-200 dark:bg-zinc-800"
                  />
                )}
                <span
                  className={cn(
                    "relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
                    STEP_TONES[step.status] || STEP_TONES.pending
                  )}
                >
                  {completed ? (
                    <FiCheckCircle size={13} aria-hidden="true" />
                  ) : current ? (
                    <span className="h-2 w-2 animate-pulse rounded-full bg-current" aria-hidden="true" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
                  )}
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        current
                          ? "text-slate-900 dark:text-white"
                          : "text-slate-700 dark:text-slate-300"
                      )}
                    >
                      {step.title}
                    </p>
                    {current && (
                      <Badge tone="amber" size="sm" icon={FiClock}>
                        Current
                      </Badge>
                    )}
                    {!current && step.badge && (
                      <Badge tone={step.badgeTone || "slate"} size="sm">
                        {step.badge}
                      </Badge>
                    )}
                  </div>
                  {step.description && (
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {step.description}
                    </p>
                  )}
                  {step.timestamp && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                      <FiClock size={11} aria-hidden="true" />
                      {step.timestamp}
                    </p>
                  )}
                </div>
              </motion.li>
            );
          })}
        </motion.ol>
      )}
    </Card>
  );
};

export default TimelineCard;