import { FiCalendar, FiClock } from "react-icons/fi";
import Modal from "../../../components/Modal/Modal";
import Button from "../../../components/Button/Button";
import Badge from "../../../components/Badges/Badge";
import PriorityBadge from "../../../components/StatusBadge/PriorityBadge";
import {
  ANNOUNCEMENT_STATUS_BADGE_TONES,
  formatDate,
  formatDateTime,
  getAnnouncementDisplayStatus,
} from "../../../utils/helpers";

const STATUS_LABELS = { active: "Active", inactive: "Inactive", expired: "Expired" };

const MetaRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
    <Icon size={13} aria-hidden="true" />
    <span>{label}</span>
    <span className="font-medium text-slate-700 dark:text-slate-200">{value}</span>
  </div>
);

/**
 * Read experience for a single announcement. Non-admins can only ever open
 * announcements the backend exposed as active; admins see status + dates.
 */
const AnnouncementDetailModal = ({ open, announcement, isAdmin = false, onClose }) => {
  if (!announcement) return null;

  const displayStatus = getAnnouncementDisplayStatus(announcement);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Announcement"
      size="md"
      footer={
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            {announcement.title}
          </h3>
          <PriorityBadge priority={announcement.priority} />
          {isAdmin && (
            <Badge tone={ANNOUNCEMENT_STATUS_BADGE_TONES[displayStatus] || "slate"} dot>
              {STATUS_LABELS[displayStatus]}
            </Badge>
          )}
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-slate-200">
          {announcement.message}
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-100 pt-3 dark:border-zinc-800">
          <MetaRow
            icon={FiCalendar}
            label="Window:"
            value={
              announcement.endDate
                ? `${formatDate(announcement.startDate)} → ${formatDate(announcement.endDate)}`
                : `From ${formatDate(announcement.startDate)} — no end date`
            }
          />
          <MetaRow icon={FiClock} label="Posted:" value={formatDateTime(announcement.createdAt)} />
        </div>
      </div>
    </Modal>
  );
};

export default AnnouncementDetailModal;
