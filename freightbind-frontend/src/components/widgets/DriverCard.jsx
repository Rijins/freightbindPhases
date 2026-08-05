import { FiMapPin, FiUser, FiUserCheck } from "react-icons/fi";
import Card from "../Card/Card";
import Badge from "../Badges/Badge";
import Avatar from "../Avatar/Avatar";
import SkeletonCard from "../Skeleton/SkeletonCard";
import { cn } from "../../utils/cn";

const AVAILABILITY_TONES = {
  Available: "emerald",
  "On Delivery": "blue",
  Resting: "amber",
  Offline: "slate",
};

/**
 * DriverCard — driver summary: avatar (with online status dot), contact,
 * availability tag, current shipment and last known location.
 *
 * Props: driver, loading, onClick, className.
 * driver: { _id, name, email?, phone?, avatar?, status, availability,
 *   currentShipment, location }
 */
const DriverCard = ({ driver, loading = false, onClick, className = "" }) => {
  if (loading) {
    return <SkeletonCard header lines={3} className={className} />;
  }

  if (!driver) return null;

  const d = driver;
  const availability = d.availability || d.status || "Offline";

  return (
    <Card
      interactive={Boolean(onClick)}
      onClick={onClick}
      className={cn("w-full", className)}
    >
      <div className="flex items-center gap-3">
        <Avatar
          name={d.name}
          src={d.avatar}
          size="lg"
          status={d.online ? "online" : d.busy ? "busy" : "offline"}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-sm font-semibold text-slate-900 dark:text-white">
            {d.name || "Unnamed driver"}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              {availability === "Available" ? (
                <FiUserCheck size={12} aria-hidden="true" />
              ) : (
                <FiUser size={12} aria-hidden="true" />
              )}
              {d.email || d.phone || "—"}
            </span>
          </p>
        </div>
        <Badge tone={AVAILABILITY_TONES[availability] || AVAILABILITY_TONES.Offline}>
          {availability}
        </Badge>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-zinc-800 dark:text-slate-400">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Current shipment
          </p>
          <p className="mt-0.5 truncate font-medium text-slate-700 dark:text-slate-300">
            {d.currentShipment?.id || d.currentShipmentId || "None"}
          </p>
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Location
          </p>
          <p className="mt-0.5 flex items-center gap-1 truncate font-medium text-slate-700 dark:text-slate-300">
            <FiMapPin size={11} aria-hidden="true" />
            {d.location || "—"}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default DriverCard;