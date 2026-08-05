import { FiArrowRight, FiCalendar, FiMapPin, FiTruck } from "react-icons/fi";
import Card from "../Card/Card";
import StatusBadge from "../StatusBadge/StatusBadge";
import PriorityBadge from "../StatusBadge/PriorityBadge";
import ProgressBar from "../Progress/ProgressBar";
import SkeletonCard from "../Skeleton/SkeletonCard";
import Avatar from "../Avatar/Avatar";
import { formatDate } from "../../utils/helpers";
import { cn } from "../../utils/cn";

/**
 * ShipmentStatusCard — a compact at-a-glance shipment summary for dashboards.
 * Shows ID, origin → destination, current status/priority, assigned dispatcher
 * and journey progress with ETA.
 *
 * Props: shipment, loading, onClick, className.
 * shipment: { _id, id?, title?, origin, destination, status, priority,
 *   assignedDispatcher, estimatedArrival, progress }
 */
const ShipmentStatusCard = ({ shipment, loading = false, onClick, className = "" }) => {
  if (loading) {
    return <SkeletonCard header lines={4} className={className} />;
  }

  if (!shipment) return null;

  const s = shipment;
  const dispatcher =
    typeof s.assignedDispatcher === "object" && s.assignedDispatcher
      ? s.assignedDispatcher.name
      : s.assignedDispatcherName || s.assignedDispatcher || "Unassigned";

  return (
    <Card
      interactive={Boolean(onClick)}
      hoverable={Boolean(onClick)}
      onClick={onClick}
      className={cn("w-full", className)}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="truncate text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
          {s.id || s._id || "Shipment"}
        </p>
        <div className="flex shrink-0 items-center gap-1.5">
          {s.priority && <PriorityBadge priority={s.priority} />}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-sm">
        <span className="inline-flex min-w-0 flex-1 items-center gap-1.5 truncate">
          <FiMapPin size={14} className="shrink-0 text-slate-400 dark:text-slate-500" aria-hidden="true" />
          <span className="truncate font-medium text-slate-900 dark:text-white">{s.origin}</span>
        </span>
        <FiArrowRight size={14} className="shrink-0 text-slate-400 dark:text-slate-500" aria-hidden="true" />
        <span className="inline-flex min-w-0 flex-1 items-center justify-end gap-1.5 truncate">
          <span className="truncate font-medium text-slate-900 dark:text-white">{s.destination}</span>
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <StatusBadge status={s.status} />
        <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <FiTruck size={13} aria-hidden="true" />
          <span className="truncate">{s.vehicleNumber || s.vehicle?.registrationNumber || "No vehicle"}</span>
        </span>
      </div>

      <div className="mt-4">
        <ProgressBar
          value={s.progress ?? 0}
          size="sm"
          showValue
          barClassName="bg-slate-300 dark:bg-zinc-600"
        />
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-zinc-800 dark:text-slate-400">
        <span className="flex min-w-0 items-center gap-2">
          <Avatar name={dispatcher} size="xs" />
          <span className="truncate">{dispatcher}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <FiCalendar size={12} aria-hidden="true" />
          {formatDate(s.estimatedArrival)}
        </span>
      </div>
    </Card>
  );
};

export default ShipmentStatusCard;