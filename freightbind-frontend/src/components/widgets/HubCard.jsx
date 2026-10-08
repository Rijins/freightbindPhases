import { FiHome, FiMapPin, FiPackage } from "react-icons/fi";
import Card from "../Card/Card";
import Badge from "../Badges/Badge";
import ProgressBar from "../Progress/ProgressBar";
import SkeletonCard from "../Skeleton/SkeletonCard";
import { cn } from "../../utils/cn";

const STATUS_TONES = {
  active: "emerald",
  inactive: "slate",
  closed: "slate",
  Active: "emerald",
  "At Capacity": "amber",
  Closed: "slate",
};

/**
 * HubCard — facility summary: hub name, location, utilization vs capacity,
 * live shipment count and status. Utilization (and the progress bar) only
 * render when an Admin has configured a capacity for the hub; otherwise the
 * card shows "—" instead of inventing a number.
 *
 * Props: hub, loading, onClick, className.
 * hub: { _id, name, location, type, status, capacity, activeShipments,
 *   totalShipments, utilization }
 */
const HubCard = ({ hub, loading = false, onClick, className = "" }) => {
  if (loading) {
    return <SkeletonCard header lines={4} className={className} />;
  }

  if (!hub) return null;

  const h = hub;
  const displayStatus =
    h.status === "active" ? "Active" : h.status === "inactive" ? "Inactive" : h.status || "—";
  const computedUtil = h.capacity
    ? Math.min(100, Math.round(((h.activeShipments || 0) / h.capacity) * 100))
    : null;

  return (
    <Card
      interactive={Boolean(onClick)}
      onClick={onClick}
      className={cn("w-full", className)}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400">
            <FiHome size={20} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-semibold text-slate-900 dark:text-white">
              {h.name || "Unnamed hub"}
            </p>
            <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-500 dark:text-slate-400">
              <FiMapPin size={11} aria-hidden="true" />
              {h.location || h.type || "—"}
            </p>
          </div>
        </div>
        <Badge tone={STATUS_TONES[h.status] || STATUS_TONES.Closed}>
          {displayStatus}
        </Badge>
      </div>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">Utilization</span>
          {h.capacity ? (
            <span className="font-medium tabular-nums text-slate-700 dark:text-slate-300">
              {h.activeShipments ?? 0} / {h.capacity}
            </span>
          ) : (
            <span className="font-medium text-slate-400 dark:text-slate-500">—</span>
          )}
        </div>
        {h.capacity ? (
          <ProgressBar value={computedUtil ?? 0} size="sm" showValue />
        ) : (
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Set a hub capacity in Hub Management to see utilization.
          </p>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-zinc-800 dark:text-slate-400">
        <FiPackage size={13} aria-hidden="true" />
        <span>{h.activeShipments ?? 0} active shipments</span>
      </div>
    </Card>
  );
};

export default HubCard;