import { useEffect, useState } from "react";
import { FiUserPlus, FiUsers } from "react-icons/fi";
import Modal from "../../../components/Modal/Modal";
import Button from "../../../components/Button/Button";
import Avatar from "../../../components/Avatar/Avatar";
import Badge from "../../../components/Badges/Badge";
import Alert from "../../../components/Alert/Alert";
import Skeleton from "../../../components/Skeleton/Skeleton";
import HubOperatorSelect from "../../../components/HubOperatorSelect/HubOperatorSelect";

/**
 * Hub operators modal — lists the Hub Operators assigned to a hub and lets
 * an Admin assign a new one. Assignment is a plain user update (PUT
 * /users/:id { hub }) — the backend rejects non-Hub-Operator roles,
 * inactive hubs and inactive users.
 */
const HubOperatorsModal = ({ hub, operators, loading, error, onClose, onAssign }) => {
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setSelectedOperator(null);
  }, [hub?._id]);

  const assign = async () => {
    if (!selectedOperator || submitting) return;
    setSubmitting(true);
    await onAssign({ userId: selectedOperator._id, hubId: hub._id });
    setSubmitting(false);
    setSelectedOperator(null);
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Hub Operators"
      description={`People assigned to ${hub?.name || "this hub"}. Only active Hub Operators can be assigned.`}
      size="lg"
    >
      <div className="space-y-5">
        <div className="rounded-xl border border-slate-200 p-4 dark:border-zinc-700">
          <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Assign a Hub Operator</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="min-w-0 flex-1">
              <HubOperatorSelect
                label=" "
                value={selectedOperator?._id || ""}
                displayUser={selectedOperator}
                onChange={setSelectedOperator}
                disabled={submitting}
              />
            </div>
            <Button onClick={assign} disabled={!selectedOperator} loading={submitting} className="shrink-0">
              <FiUserPlus size={16} aria-hidden="true" /> Assign
            </Button>
          </div>
          {error && (
            <Alert severity="error" className="mt-3" title="Unable to assign operator">
              {typeof error === "string" ? error : error.message || "Something went wrong. Please try again."}
            </Alert>
          )}
        </div>

        <div>
          <div className="mb-2 flex items-center gap-2">
            <FiUsers size={14} className="text-slate-400" aria-hidden="true" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Assigned operators ({operators.length})
            </p>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 dark:border-zinc-800">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : operators.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center dark:border-zinc-700">
              <FiUsers size={24} className="mx-auto text-slate-300 dark:text-zinc-600" aria-hidden="true" />
              <p className="mt-2 text-sm font-medium text-slate-700 dark:text-zinc-200">No operators assigned</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                Assign an active Hub Operator to this hub to start operations.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {operators.map((operator) => (
                <li key={operator._id} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 dark:border-zinc-800">
                  <Avatar name={operator.fullName} src={operator.profileImage} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{operator.fullName}</p>
                    <p className="truncate text-xs text-slate-500 dark:text-zinc-400">{operator.email}</p>
                  </div>
                  <Badge tone="emerald" dot>
                    Active
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default HubOperatorsModal;
