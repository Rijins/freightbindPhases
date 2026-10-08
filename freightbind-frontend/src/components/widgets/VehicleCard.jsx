import { FiBox, FiTool, FiTruck } from "react-icons/fi";
import Card from "../Card/Card";
import Badge from "../Badges/Badge";
import SkeletonCard from "../Skeleton/SkeletonCard";
import Avatar from "../Avatar/Avatar";
import { formatWeight } from "../../utils/helpers";
import { cn } from "../../utils/cn";

const STATUS_TONES = {
  Available: "emerald",
  Assigned: "blue",
  "In Transit": "indigo",
  Maintenance: "amber",
  Offline: "slate",
};

/**
 * VehicleCard — fleet summary: registration, driver, current load and active
 * shipment. Vehicles come from the analytics endpoint (real shipments carrying
 * a vehicleNumber), so make/model/capacity are absent by design and the card
 * only shows the load that exists.
 *
 * Props: vehicle, loading, onClick, className.
 * vehicle: { _id, registrationNumber, driver, status, currentShipmentId,
 *   currentLoad, currentShipment { id, weight, title } }
 */
const VehicleCard = ({ vehicle, loading = false, onClick, className = "" }) => {
  if (loading) {
    return <SkeletonCard header lines={4} className={className} />;
  }

  if (!vehicle) return null;

  const v = vehicle;
  const driver =
    typeof v.driver === "object" && v.driver ? v.driver.name : v.driverName || v.driver || "Unassigned";
  const hasLoad = typeof v.currentLoad === "number";

  return (
    <Card
      interactive={Boolean(onClick)}
      onClick={onClick}
      className={cn("w-full", className)}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-slate-300">
            <FiTruck size={20} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-semibold uppercase tracking-wide text-slate-900 dark:text-white">
              {v.registrationNumber || v.numberPlate || "—"}
            </p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              {[v.make, v.model].filter(Boolean).join(" ") || v.type || "Unknown model"}
            </p>
          </div>
        </div>
        <Badge tone={STATUS_TONES[v.status] || STATUS_TONES.Offline}>{v.status || "—"}</Badge>
      </div>

      {hasLoad && (
        <div className="mt-4 flex items-center gap-2">
          <FiBox size={14} className="text-slate-400 dark:text-slate-500" aria-hidden="true" />
          <span className="text-xs text-slate-600 dark:text-slate-300">
            Loaded {formatWeight(v.currentLoad)}
          </span>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-zinc-800 dark:text-slate-400">
        <span className="flex min-w-0 items-center gap-2">
          <Avatar name={driver} size="xs" />
          <span className="truncate">{driver}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <FiTool size={12} aria-hidden="true" />
          <span className="truncate">
            {v.currentShipment?.title || v.currentShipment?.id || v.currentShipmentId || "No shipments"}
          </span>
        </span>
      </div>
    </Card>
  );
};

export default VehicleCard;