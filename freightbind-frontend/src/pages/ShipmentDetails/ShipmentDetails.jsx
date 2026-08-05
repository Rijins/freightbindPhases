import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiArrowLeft, FiEdit2, FiTrash2, FiClock } from "react-icons/fi";
import Card, { CardHeader } from "../../components/Card/Card";
import Loader from "../../components/Loader/Loader";
import Button from "../../components/Button/Button";
import Modal from "../../components/Modal/Modal";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import PriorityBadge from "../../components/StatusBadge/PriorityBadge";
import {
  fetchShipmentById,
  deleteShipment,
  clearSelectedShipment,
  clearActionStatus,
} from "../../features/shipments/shipmentSlice";
import useAuth from "../../hooks/useAuth";
import useShipmentRoom from "../../hooks/useShipmentRoom";
import { canDeleteShipment, canEditShipment, formatDate, formatDateTime, formatWeight } from "../../utils/helpers";

const Field = ({ label, value }) => (
  <div>
    <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-zinc-500">{label}</p>
    <p className="mt-1 text-sm text-slate-800 dark:text-zinc-200">{value ?? "—"}</p>
  </div>
);

const ShipmentDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selected, detailLoading, detailError, actionLoading, actionError } = useSelector(
    (state) => state.shipments
  );
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Join this shipment's realtime room so status/assignment/timeline changes
  // made by other users appear instantly. Leaves on unmount.
  useShipmentRoom(id);

  useEffect(() => {
    dispatch(fetchShipmentById(id));
    return () => {
      dispatch(clearSelectedShipment());
      dispatch(clearActionStatus());
    };
  }, [dispatch, id]);

  const handleDelete = async () => {
    const result = await dispatch(deleteShipment(id));
    if (deleteShipment.fulfilled.match(result)) {
      navigate("/shipments", { replace: true });
    }
  };

  if (detailLoading) return <Loader fullPage label="Loading shipment..." />;

  if (detailError) {
    return (
      <Card>
        <p className="text-sm text-signal-rust dark:text-red-400">{detailError}</p>
      </Card>
    );
  }

  if (!selected) return null;

  const showEdit = canEditShipment(user, selected);
  const showDelete = canDeleteShipment(user?.role) && selected.status !== "Delivered";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate("/shipments")}
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-navy-900 mb-2 dark:text-zinc-400 dark:hover:text-white"
          >
            <FiArrowLeft size={14} /> Back to Shipments
          </button>
          <h1 className="text-2xl font-semibold text-navy-900 flex items-center gap-3 flex-wrap dark:text-white">
            {selected.title}
            <StatusBadge status={selected.status} />
          </h1>
          <p className="text-sm font-mono text-slate-500 mt-1 dark:text-zinc-400">{selected.shipmentId}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to={`/shipments/${selected._id}/timeline`}>
            <Button variant="outline" icon={FiClock}>
              Timeline
            </Button>
          </Link>
          {showEdit && (
            <Link to={`/shipments/edit/${selected._id}`}>
              <Button variant="outline" icon={FiEdit2}>
                Edit
              </Button>
            </Link>
          )}
          {showDelete && (
            <Button variant="danger" icon={FiTrash2} onClick={() => setConfirmOpen(true)}>
              Delete
            </Button>
          )}
        </div>
      </div>

      {actionError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-signal-rust dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          {actionError.message}
        </div>
      )}

      <Card>
        <CardHeader title="Overview" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-5">
          <Field label="Cargo Type" value={selected.cargoType} />
          <Field label="Shipment Type" value={selected.shipmentType} />
          <Field label="Priority" value={<PriorityBadge priority={selected.priority} />} />
          <Field label="Status" value={<StatusBadge status={selected.status} />} />
          <Field label="Origin" value={selected.origin} />
          <Field label="Destination" value={selected.destination} />
          <Field label="Current Location" value={selected.currentLocation} />
          <Field label="Weight" value={formatWeight(selected.weight)} />
          <Field label="Container Number" value={selected.containerNumber} />
          <Field label="Vehicle Number" value={selected.vehicleNumber} />
          <Field label="Dispatcher" value={selected.assignedDispatcher?.fullName} />
          <Field label="Created By" value={selected.createdBy?.fullName} />
        </div>
      </Card>

      <Card>
        <CardHeader title="Schedule" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-5">
          <Field label="Estimated Departure" value={formatDateTime(selected.estimatedDeparture)} />
          <Field label="Estimated Arrival" value={formatDateTime(selected.estimatedArrival)} />
          <Field label="Actual Departure" value={formatDateTime(selected.actualDeparture)} />
          <Field label="Actual Arrival" value={formatDateTime(selected.actualArrival)} />
          <Field label="Created Date" value={formatDate(selected.createdAt)} />
          <Field label="Updated Date" value={formatDate(selected.updatedAt)} />
        </div>
      </Card>

      <Card>
        <CardHeader title="Description & Notes" />
        <div className="space-y-4">
          <Field label="Description" value={selected.description} />
          <Field label="Notes" value={selected.notes} />
        </div>
      </Card>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Delete shipment"
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" loading={actionLoading} onClick={handleDelete}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-zinc-300">
          Are you sure you want to delete shipment{" "}
          <span className="font-medium text-navy-900 dark:text-white">{selected.shipmentId}</span>? This action
          cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default ShipmentDetails;