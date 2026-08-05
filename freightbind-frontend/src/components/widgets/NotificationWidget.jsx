import { motion } from "framer-motion";
import {
  FiAlertCircle,
  FiAlertTriangle,
  FiBell,
  FiCheckCircle,
  FiChevronRight,
  FiInfo,
} from "react-icons/fi";
import Card, { CardHeader } from "../Card/Card";
import Skeleton from "../Skeleton/Skeleton";
import Badge from "../Badges/Badge";
import EmptyState from "../EmptyState/EmptyState";
import { cn } from "../../utils/cn";
import { fadeInUp, staggerContainer } from "../../animations";

const TYPE_CONFIG = {
  success: { icon: FiCheckCircle, tile: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" },
  warning: { icon: FiAlertTriangle, tile: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400" },
  critical: { icon: FiAlertCircle, tile: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400" },
  info: { icon: FiInfo, tile: "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400" },
  default: { icon: FiBell, tile: "bg-slate-100 text-slate-600 dark:bg-zinc-700/60 dark:text-slate-300" },
};

const PRIORITY_DOT = {
  Critical: "bg-red-500",
  High: "bg-amber-500",
  Medium: "bg-blue-500",
  Low: "bg-slate-400",
};

/**
 * NotificationWidget — a dropdown-style head per notification with priority
 * awareness, unread emphasis, timestamp and an optional click action. Feed it
 * anything shaped like a notification; no notification API is assumed.
 *
 * Props: items, loading, title, subtitle, onMarkAllRead, onViewAll, emptyTitle,
 *   emptyDescription, className.
 * items: { id, type, title, body, timestamp, priority, unread, onClick }
 */
const NotificationWidget = ({
  items = [],
  loading = false,
  title = "Notifications",
  subtitle,
  onMarkAllRead,
  onViewAll,
  emptyTitle = "You're all caught up",
  emptyDescription = "No new notifications right now.",
  className = "",
}) => {
  const readAllAvailable = items.some((n) => n.unread);

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader
        title={title}
        subtitle={subtitle}
        action={
          (onMarkAllRead || onViewAll) && (
            <div className="flex items-center gap-1">
              {onMarkAllRead && readAllAvailable && (
                <button
                  type="button"
                  onClick={onMarkAllRead}
                  className="rounded-lg px-2 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                >
                  Mark all read
                </button>
              )}
              {onViewAll && (
                <button
                  type="button"
                  onClick={onViewAll}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                  aria-label={`View all ${title.toLowerCase()}`}
                >
                  View all
                  <FiChevronRight size={14} aria-hidden="true" />
                </button>
              )}
            </div>
          )
        }
      />

      {loading ? (
        <div className="space-y-4" aria-busy="true">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
              <div className="w-full space-y-2">
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} size="sm" />
      ) : (
        <motion.ul
          variants={staggerContainer(0.05)}
          initial="hidden"
          animate="visible"
          className="max-h-[420px] divide-y divide-slate-100 overflow-y-auto scrollbar-thin dark:divide-zinc-800"
        >
          {items.map((item) => {
            const conf = TYPE_CONFIG[item.type] || TYPE_CONFIG.default;
            const Icon = conf.icon;
            return (
              <motion.li variants={fadeInUp} key={item.id}>
                <button
                  type="button"
                  onClick={item.onClick}
                  disabled={!item.onClick}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-lg px-2 py-3 text-left transition-colors",
                    item.unread && "bg-slate-50/80 dark:bg-zinc-800/40",
                    item.onClick
                      ? "hover:bg-slate-50 dark:hover:bg-zinc-800/60"
                      : "cursor-default"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                      conf.tile
                    )}
                  >
                    <Icon size={16} aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      {item.priority && (
                        <span
                          className={cn(
                            "h-2 w-2 shrink-0 rounded-full",
                            PRIORITY_DOT[item.priority] || PRIORITY_DOT.Low
                          )}
                          title={`Priority: ${item.priority}`}
                          aria-label={`Priority: ${item.priority}`}
                        />
                      )}
                      <span
                        className={cn(
                          "truncate text-sm font-medium",
                          item.unread
                            ? "text-slate-900 dark:text-white"
                            : "text-slate-600 dark:text-slate-300"
                        )}
                      >
                        {item.title}
                      </span>
                      {item.unread && (
                        <Badge tone="blue" size="sm">
                          New
                        </Badge>
                      )}
                    </span>
                    {item.message && (
                      <span
                        className={cn(
                          "mt-0.5 block text-sm",
                          item.unread
                            ? "text-slate-600 dark:text-slate-300"
                            : "text-slate-500 dark:text-slate-400"
                        )}
                      >
                        {item.message}
                      </span>
                    )}
                    {item.timestamp && (
                      <span className="mt-0.5 block text-xs text-slate-400 dark:text-slate-500">
                        {item.timestamp}
                      </span>
                    )}
                  </span>
                </button>
              </motion.li>
            );
          })}
        </motion.ul>
      )}
    </Card>
  );
};

export default NotificationWidget;