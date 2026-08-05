import { motion } from "framer-motion";
import Badge from "../Badges/Badge";
import Skeleton from "../Skeleton/Skeleton";
import PreviewBadge from "./PreviewBadge";
import { cn } from "../../utils/cn";
import { EASE } from "../../animations";

const STATUS_META = {
  operational: { label: "Operational", tone: "emerald" },
  degraded: { label: "Degraded", tone: "amber" },
  down: { label: "Down", tone: "red" },
};

/**
 * SystemHealthWidget — one row per backend service with status, latency and
 * uptime. Section header includes an overall status badge. No health API
 * exists yet, so consumers pass preview rows and mark the panel with the
 * built-in PreviewBadge via `preview`.
 *
 * Props: services [{ id, name, status, latency, uptime }], loading, preview,
 *   title, subtitle, overall, className.
 */
const SystemHealthWidget = ({
  services = [],
  loading = false,
  preview = false,
  title = "System Health",
  subtitle = "Live status of platform services.",
  overall,
  className = "",
}) => {
  if (loading) {
    return (
      <div
        className={cn(
          "rounded-[20px] border border-slate-200/80 bg-white p-5 shadow-panel dark:border-zinc-800 dark:bg-zinc-900",
          className
        )}
      >
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <div className="mt-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const statusMeta = STATUS_META[overall] || STATUS_META.operational;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: EASE }}
      className={cn(
        "rounded-[20px] border border-slate-200/80 bg-white p-5 shadow-panel dark:border-zinc-800 dark:bg-zinc-900",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
            {title}
          </h3>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {preview && <PreviewBadge />}
          <Badge tone={statusMeta.tone} size="sm" dot>
            {statusMeta.label}
          </Badge>
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {services.map((service) => {
          const meta = STATUS_META[service.status] || STATUS_META.operational;
          return (
            <li
              key={service.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-3.5 py-2.5 dark:border-zinc-800 dark:bg-zinc-800/40"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  className={cn("h-2 w-2 shrink-0 rounded-full", {
                    "bg-emerald-500": service.status === "operational",
                    "bg-amber-500": service.status === "degraded",
                    "bg-red-500": service.status === "down",
                  })}
                  aria-hidden="true"
                />
                <span className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                  {service.name}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <span className="hidden font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400 sm:inline">
                  {service.latency}
                </span>
                <span className="hidden font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400 md:inline">
                  {service.uptime}
                </span>
                <Badge tone={meta.tone} size="sm">
                  {meta.label}
                </Badge>
              </div>
            </li>
          );
        })}
      </ul>
    </motion.section>
  );
};

export default SystemHealthWidget;
