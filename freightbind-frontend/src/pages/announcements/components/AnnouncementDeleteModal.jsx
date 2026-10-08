import { FiTrash2 } from "react-icons/fi";
import Modal from "../../../components/Modal/Modal";
import Button from "../../../components/Button/Button";

/**
 * Delete confirmation for announcements. Deleting removes the announcement
 * record only — already-delivered notification copies stay in users' inboxes
 * (like a sent email), which the dialog states explicitly.
 */
const AnnouncementDeleteModal = ({ open, announcement, submitting = false, onClose, onConfirm }) => {
  if (!announcement) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete this announcement?"
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="danger" loading={submitting} onClick={onConfirm}>
            Delete announcement
          </Button>
        </>
      }
    >
      <div className="flex gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400">
          <FiTrash2 size={18} aria-hidden="true" />
        </span>
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-900 dark:text-white">{announcement.title}</p>
          <p className="text-sm text-slate-600 dark:text-zinc-400">
            This will permanently remove the announcement. Users will no longer see it, but
            already-delivered notifications stay in their inboxes.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default AnnouncementDeleteModal;
