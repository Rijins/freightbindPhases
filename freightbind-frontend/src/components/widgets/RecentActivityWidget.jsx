import { motion } from "framer-motion";
import { FiClock, FiActivity, FiChevronRight } from "react-icons/fi";
import Card, { CardHeader } from "../Card/Card";
import Skeleton from "../Skeleton/Skeleton";
import Badge from "../Badges/Badge";
import EmptyState from "../EmptyState/EmptyState";
import { cn } from "../../utils/cn";
import { fadeInUp, staggerContainer } from "../../animations";

const TYPE_STYLES = {
  shipment: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  fleet: "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
  notification: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  ai: "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
  hub: "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400",
  default: "bg-slate-100 text-slate-600 dark:bg-zinc-700/60 dark:text-slate-300",
};

/**
 * RecentActivityWidget — a scrollable feed of the latest events (shipments,
 * fleet, notifications, AI nudges). Each row shows a type-toned icon tile, a
 * title, an actor line, a timestamp and an optional status tag.
 *
 * Props: items, loading, title, subtitle, onViewAll, emptyTitle,
 *   emptyDescription, className.
 * items: { id, type, title, user, timestamp, status, badgeTone, onClick }
 */
const RecentActivityWidget = ({
  items = [],
  loading = false,
  title = "Recent Activity",
  subtitle,
  onViewAll,
  emptyTitle = "No recent activity",
  emptyDescription = "New events will appear here as they happen.",
  className = "",
}) => {
  const tileClass = (type) => TYPE_STYLES[type] || TYPE_STYLES.default;

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader
        title={title}
        subtitle={subtitle}
        action={
          onViewAll && (
            <button
              type="button"
              onClick={onViewAll}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-zinc-800 dark:hover:text-white"
              aria-label={`View all ${title.toLowerCase()}`}
            >
              View all
              <FiChevronRight size={14} aria-hidden="true" />
            </button>
          )
        }
      />

      {loading ? (
        <div className="space-y-4" aria-busy="true">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
              <div className="w-full space-y-2">
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
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
          {items.map((item) => (
            <motion.li variants={fadeInUp} key={item.id}>
              <button
                type="button"
                onClick={item.onClick}
                disabled={!item.onClick}
                className={cn(
                  "flex w-full items-start gap-3 rounded-lg px-2 py-3 text-left transition-colors",
                  item.onClick
                    ? "hover:bg-slate-50 dark:hover:bg-zinc-800/40"
                    : "cursor-default"
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                    tileClass(item.type)
                  )}
                >
                  {item.icon ? (
                    <item.icon size={16} aria-hidden="true" />
                  ) : (
                    <FiActivity size={16} aria-hidden="true" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      {item.title}
                    </span>
                    {item.status && (
                      <Badge tone={item.badgeTone || "slate"} size="sm">
                        {item.status}
                      </Badge>
                    )}
                  </span>
                  <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {item.user && <span>{item.user}</span>}
                    {item.timestamp && (
                      <span className="inline-flex items-center gap-1">
                        <FiClock size={11} aria-hidden="true" />
                        {item.timestamp}
                      </span>
                    )}
                  </span>
                </span>
              </button>
            </motion.li>
          ))}
        </motion.ul>
      )}
    </Card>
  );
};

export default RecentActivityWidget;