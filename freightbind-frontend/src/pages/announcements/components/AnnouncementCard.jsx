import { FiCalendar, FiClock, FiEdit2, FiEye, FiToggleLeft, FiToggleRight, FiTrash2 } from "react-icons/fi";
import Card from "../../../components/Card/Card";
import Badge from "../../../components/Badges/Badge";
import PriorityBadge from "../../../components/StatusBadge/PriorityBadge";
import {
  ANNOUNCEMENT_STATUS_BADGE_TONES,
  formatDate,
  formatDateTime,
  getAnnouncementDisplayStatus,
} from "../../../utils/helpers";

const STATUS_LABELS = { active: "Active", inactive: "Inactive", expired: "Expired" };

/**
 * Announcement list card — priority indicator, message preview, date window,
 * and (for admins) the management actions. Non-admins never see admin
 * controls here; the backend hides non-visible announcements entirely.
 */
const AnnouncementCard = ({ announcement, isAdmin = false, onView, onEdit, onToggleStatus, onDelete }) => {
  const displayStatus = getAnnouncementDisplayStatus(announcement);
  const isActive = displayStatus === "active";

  return (
    <Card hoverable className="cursor-pointer" onClick={onView}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
              {announcement.title}
            </h3>
            <PriorityBadge priority={announcement.priority} />
            {isAdmin && (
              <Badge tone={ANNOUNCEMENT_STATUS_BADGE_TONES[displayStatus] || "slate"} dot>
                {STATUS_LABELS[displayStatus]}
              </Badge>
            )}
          </div>
          <p className="mt-1.5 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
            {announcement.message}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 dark:text-zinc-500">
            <span className="flex items-center gap-1">
              <FiCalendar size={12} aria-hidden="true" />
              {formatDate(announcement.startDate)}
              {announcement.endDate ? ` → ${formatDate(announcement.endDate)}` : " → No end date"}
            </span>
            <span className="flex items-center gap-1">
              <FiClock size={12} aria-hidden="true" />
              Posted {formatDateTime(announcement.createdAt)}
            </span>
          </div>
        </div>

        {isAdmin && (
          <div className="flex shrink-0 items-center gap-1" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              onClick={onView}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-navy-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
              title="View announcement"
              aria-label={`View ${announcement.title}`}
            >
              <FiEye size={16} />
            </button>
            <button
              type="button"
              onClick={onEdit}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-navy-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
              title="Edit announcement"
              aria-label={`Edit ${announcement.title}`}
            >
              <FiEdit2 size={16} />
            </button>
            <button
              type="button"
              onClick={onToggleStatus}
              className={
                isActive
                  ? "rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-red-500 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-red-400"
                  : "rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-emerald-600 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-emerald-400"
              }
              title={isActive ? "Deactivate announcement" : "Activate announcement"}
              aria-label={`${isActive ? "Deactivate" : "Activate"} ${announcement.title}`}
            >
              {isActive ? <FiToggleLeft size={18} /> : <FiToggleRight size={18} />}
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:text-zinc-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
              title="Delete announcement"
              aria-label={`Delete ${announcement.title}`}
            >
              <FiTrash2 size={16} />
            </button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AnnouncementCard;
