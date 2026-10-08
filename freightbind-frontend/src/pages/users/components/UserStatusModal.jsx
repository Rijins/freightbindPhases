import { FiUserCheck, FiUserX } from "react-icons/fi";
import Modal from "../../../components/Modal/Modal";
import Button from "../../../components/Button/Button";

/**
 * Activate / deactivate confirmation. Deactivation is never accidental:
 * the dialog explains the login consequence before the admin commits.
 */
const UserStatusModal = ({ open, user, submitting = false, onClose, onConfirm }) => {
  if (!user) return null;

  const isDeactivate = user.status === "active";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isDeactivate ? "Deactivate this account?" : "Activate this account?"}
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
          {isDeactivate ? (
            <FiUserX size={18} aria-hidden="true" />
          ) : (
            <FiUserCheck size={18} aria-hidden="true" />
          )}
        </span>
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-900 dark:text-white">{user.fullName}</p>
          <p className="text-sm text-slate-600 dark:text-zinc-400">
            {isDeactivate ? (
              <>
                This user will no longer be able to log in or receive realtime updates until the
                account is reactivated.
              </>
            ) : (
              <>This user will regain full access to the platform and can log in again.</>
            )}
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default UserStatusModal;
