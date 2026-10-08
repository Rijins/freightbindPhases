import { FiAlertTriangle } from "react-icons/fi";
import Modal from "../../../components/Modal/Modal";
import Button from "../../../components/Button/Button";
import Alert from "../../../components/Alert/Alert";

const HubStatusModal = ({ hub, submitting, error, onConfirm, onClose }) => {
  const nextStatus = hub.status === "active" ? "inactive" : "active";
  const isDeactivating = nextStatus === "inactive";

  return (
    <Modal
      open
      onClose={onClose}
      title={isDeactivating ? "Deactivate hub" : "Activate hub"}
      description={`${hub.name} is currently ${hub.status}.`}
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/60">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
            <FiAlertTriangle size={16} aria-hidden="true" />
          </span>
          <div className="text-sm">
            <p className="font-medium text-slate-900 dark:text-white">
              {isDeactivating
                ? "Inactive hubs cannot receive new shipment assignments."
                : "Activating restores assignment eligibility for this hub."}
            </p>
            <p className="mt-1 text-slate-500 dark:text-zinc-400">
              {isDeactivating
                ? "Existing Hub Operators and shipments keep their references — only new assignments are blocked."
                : "Hub Operators and shipments can be assigned to this hub again."}
            </p>
          </div>
        </div>

        {error && (
          <Alert severity="error" title={isDeactivating ? "Unable to deactivate hub" : "Unable to activate hub"}>
            {error.message || "Something went wrong. Please try again."}
          </Alert>
        )}

        <div className="flex justify-end gap-3 pt-1">
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant={isDeactivating ? "danger" : "success"} onClick={onConfirm} loading={submitting}>
            {isDeactivating ? "Deactivate Hub" : "Activate Hub"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default HubStatusModal;
