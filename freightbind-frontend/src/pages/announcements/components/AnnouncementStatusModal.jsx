import { FiBell, FiBellOff } from "react-icons/fi";
import Modal from "../../../components/Modal/Modal";
import Button from "../../../components/Button/Button";

/**
 * Activate / deactivate confirmation. Activating is never accidental: the
 * dialog explains that the announcement is published to every user and a
 * realtime notification is delivered through the existing pipeline.
 */
const AnnouncementStatusModal = ({ open, announcement, submitting = false, onClose, onConfirm }) => {
  if (!announcement) return null;

  const isDeactivate = announcement.status === "active";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isDeactivate ? "Deactivate this announcement?" : "Activate this announcement?"}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant={isDeactivate ? "danger" : "success"}
            loading={submitting}
            onClick={onConfirm}
          >
            {isDeactivate ? "Deactivate" : "Activate"}
          </Button>
        </>
      }
    >
      <div className="flex gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-slate-300">
          {isDeactivate ? <FiBellOff size={18} aria-hidden="true" /> : <FiBell size={18} aria-hidden="true" />}
        </span>
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-900 dark:text-white">{announcement.title}</p>
          <p className="text-sm text-slate-600 dark:text-zinc-400">
            {isDeactivate ? (
              <>
                This announcement will no longer be visible to users. Already-delivered
                notifications remain in their inboxes.
              </>
            ) : (
              <>
                This announcement will go live immediately and every active user will receive a
                realtime notification.
              </>
            )}
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default AnnouncementStatusModal;
