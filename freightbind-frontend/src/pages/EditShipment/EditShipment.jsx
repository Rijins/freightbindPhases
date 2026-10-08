import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiArrowLeft } from "react-icons/fi";
import Card, { CardHeader } from "../../components/Card/Card";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import Loader from "../../components/Loader/Loader";
import DispatcherSelect from "../../components/DispatcherSelect/DispatcherSelect";
import HubSelect from "../../components/HubSelect/HubSelect";
import {
  fetchShipmentById,
  updateShipment,
  clearSelectedShipment,
  clearActionStatus,
} from "../../features/shipments/shipmentSlice";
import useAuth from "../../hooks/useAuth";
import { SHIPMENT_PRIORITIES, SHIPMENT_STATUSES } from "../../utils/constants";
import { getEditableFields, getAllowedNextStatuses, toDateTimeInputValue } from "../../utils/helpers";

const optionalString = z.string().trim().optional().or(z.literal(""));

const editShipmentSchema = z
  .object({
    title: z.string().trim().min(1, "Shipment title cannot be empty").optional().or(z.literal("")),
    description: optionalString,
    cargoType: z.string().trim().optional().or(z.literal("")),
    shipmentType: z.string().trim().optional().or(z.literal("")),
    origin: z.string().trim().optional().or(z.literal("")),
    destination: z.string().trim().optional().or(z.literal("")),
    currentLocation: optionalString,
    priority: z.enum(SHIPMENT_PRIORITIES).optional().or(z.literal("")),
    status: z.enum(SHIPMENT_STATUSES).optional().or(z.literal("")),
    assignedDispatcher: optionalString,
    estimatedDeparture: optionalString,
    estimatedArrival: optionalString,
    actualDeparture: optionalString,
    actualArrival: optionalString,
    weight: z.union([z.string().length(0), z.coerce.number().min(0, "Weight cannot be negative")]).optional(),
    containerNumber: optionalString,
    vehicleNumber: optionalString,
    notes: optionalString,
  })
  .refine(
    (data) =>
      !data.estimatedDeparture ||
      !data.estimatedArrival ||
      new Date(data.estimatedArrival) >= new Date(data.estimatedDeparture),
    { message: "Estimated arrival cannot be before estimated departure", path: ["estimatedArrival"] }
  )
  .refine(
    (data) =>
      !data.actualDeparture ||
      !data.actualArrival ||
      new Date(data.actualArrival) >= new Date(data.actualDeparture),
    { message: "Actual arrival cannot be before actual departure", path: ["actualArrival"] }
  );

const StatusInline = ({ value }) => <span className="font-medium text-navy-900 dark:text-white">{value}</span>;

const EditShipment = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selected, detailLoading, detailError, actionLoading, actionError } = useSelector(
    (state) => state.shipments
  );

  const editableFields = useMemo(() => getEditableFields(user, selected), [user, selected]);
  const isField = (name) => editableFields.includes(name);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(editShipmentSchema),
  });

  useEffect(() => {
    dispatch(fetchShipmentById(id));
    return () => {
      dispatch(clearSelectedShipment());
      dispatch(clearActionStatus());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (selected) {
      reset({
        title: selected.title || "",
        description: selected.description || "",
        cargoType: selected.cargoType || "",
        shipmentType: selected.shipmentType || "",
        origin: selected.origin || "",
        destination: selected.destination || "",
        currentLocation: selected.currentLocation || "",
        priority: selected.priority || "",
        status: selected.status || "",
        assignedDispatcher: selected.assignedDispatcher?._id || selected.assignedDispatcher || "",
        hub: selected.hub?._id || selected.hub || "",
        estimatedDeparture: toDateTimeInputValue(selected.estimatedDeparture),
        estimatedArrival: toDateTimeInputValue(selected.estimatedArrival),
        actualDeparture: toDateTimeInputValue(selected.actualDeparture),
        actualArrival: toDateTimeInputValue(selected.actualArrival),
        weight: selected.weight ?? "",
        containerNumber: selected.containerNumber || "",
        vehicleNumber: selected.vehicleNumber || "",
        notes: selected.notes || "",
      });
    }
  }, [selected, reset]);

  const currentStatus = watch("status");
  const statusOptions = selected
    ? [selected.status, ...getAllowedNextStatuses(selected.status)]
        .filter((v, i, arr) => arr.indexOf(v) === i)
        .map((s) => ({ value: s, label: s }))
    : [];

  const priorityOptions = SHIPMENT_PRIORITIES.map((p) => ({ value: p, label: p }));

  const onSubmit = async (values) => {
    dispatch(clearActionStatus());

    const payload = {};
    editableFields.forEach((field) => {
      const value = values[field];
      if (value === undefined || value === "") return;
      payload[field] = field === "weight" ? Number(value) : value;
    });

    if (Object.keys(payload).length === 0) return;

    const result = await dispatch(updateShipment({ id, payload }));
    if (updateShipment.fulfilled.match(result)) {
      navigate(`/shipments/${id}`, { replace: true });
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

  return (
    <div className="space-y-6">
      <div>
        <button
          type="button"
          onClick={() => navigate(`/shipments/${id}`)}
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-navy-900 mb-2 dark:text-zinc-400 dark:hover:text-white"
        >
          <FiArrowLeft size={14} /> Back to Shipment Details
        </button>
        <h1 className="text-2xl font-semibold text-navy-900 dark:text-white">
          Edit Shipment <span className="font-mono text-lg text-slate-400 dark:text-zinc-500">{selected.shipmentId}</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1 dark:text-zinc-400">
          Your role ({user?.role}) determines which fields below are editable. The backend
          enforces this regardless of what the form allows.
        </p>
      </div>

      {actionError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-signal-rust dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          <p className="font-medium">{actionError.message}</p>
          {actionError.errors?.length > 0 && (
            <ul className="list-disc list-inside mt-1 space-y-0.5">
              {actionError.errors.map((msg) => (
                <li key={msg}>{msg}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <Card>
        <CardHeader title="Shipment Details" />
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input label="Title" name="title" disabled={!isField("title")} error={errors.title?.message} {...register("title")} />
            <Input
              label="Cargo Type"
              name="cargoType"
              disabled={!isField("cargoType")}
              error={errors.cargoType?.message}
              {...register("cargoType")}
            />
            <Input
              label="Shipment Type"
              name="shipmentType"
              disabled={!isField("shipmentType")}
              error={errors.shipmentType?.message}
              {...register("shipmentType")}
            />
            <Input
              label="Priority"
              name="priority"
              type="select"
              options={priorityOptions}
              disabled={!isField("priority")}
              error={errors.priority?.message}
              {...register("priority")}
            />
            <Input label="Origin" name="origin" disabled={!isField("origin")} error={errors.origin?.message} {...register("origin")} />
            <Input
              label="Destination"
              name="destination"
              disabled={!isField("destination")}
              error={errors.destination?.message}
              {...register("destination")}
            />
            <Input
              label="Current Location"
              name="currentLocation"
              disabled={!isField("currentLocation")}
              error={errors.currentLocation?.message}
              {...register("currentLocation")}
            />
            <Input
              label="Status"
              name="status"
              type="select"
              options={statusOptions}
              disabled={!isField("status") || statusOptions.length <= 1}
              error={errors.status?.message}
              {...register("status")}
            />
            {currentStatus && currentStatus !== selected.status && (
              <p className="text-xs text-slate-500 -mt-3 sm:col-span-2 dark:text-zinc-400">
                Changing status from <StatusInline value={selected.status} /> to{" "}
                <StatusInline value={currentStatus} />.
              </p>
            )}
            <Controller
              name="assignedDispatcher"
              control={control}
              render={({ field }) => (
                <DispatcherSelect
                  label="Assigned Dispatcher"
                  value={field.value}
                  displayUser={selected.assignedDispatcher?._id ? selected.assignedDispatcher : null}
                  onChange={(dispatcher) => field.onChange(dispatcher ? dispatcher._id : "")}
                  disabled={!isField("assignedDispatcher")}
                  error={errors.assignedDispatcher?.message}
                />
              )}
            />
            <Controller
              name="hub"
              control={control}
              render={({ field }) => (
                <HubSelect
                  label="Relevant Hub"
                  value={field.value}
                  displayHub={selected.hub?._id ? selected.hub : null}
                  onChange={(hub) => field.onChange(hub ? hub._id : "")}
                  disabled={!isField("hub")}
                  error={errors.hub?.message}
                />
              )}
            />
            <Input
              label="Estimated Departure"
              name="estimatedDeparture"
              type="datetime-local"
              disabled={!isField("estimatedDeparture")}
              error={errors.estimatedDeparture?.message}
              {...register("estimatedDeparture")}
            />
            <Input
              label="Estimated Arrival"
              name="estimatedArrival"
              type="datetime-local"
              disabled={!isField("estimatedArrival")}
              error={errors.estimatedArrival?.message}
              {...register("estimatedArrival")}
            />
            <Input
              label="Actual Departure"
              name="actualDeparture"
              type="datetime-local"
              disabled={!isField("actualDeparture")}
              error={errors.actualDeparture?.message}
              {...register("actualDeparture")}
            />
            <Input
              label="Actual Arrival"
              name="actualArrival"
              type="datetime-local"
              disabled={!isField("actualArrival")}
              error={errors.actualArrival?.message}
              {...register("actualArrival")}
            />
            <Input
              label="Weight (kg)"
              name="weight"
              type="number"
              step="0.01"
              min="0"
              disabled={!isField("weight")}
              error={errors.weight?.message}
              {...register("weight")}
            />
            <Input
              label="Container Number"
              name="containerNumber"
              disabled={!isField("containerNumber")}
              error={errors.containerNumber?.message}
              {...register("containerNumber")}
            />
            <Input
              label="Vehicle Number"
              name="vehicleNumber"
              disabled={!isField("vehicleNumber")}
              error={errors.vehicleNumber?.message}
              {...register("vehicleNumber")}
            />
          </div>

          <Input
            label="Description"
            name="description"
            type="textarea"
            disabled={!isField("description")}
            error={errors.description?.message}
            {...register("description")}
          />
          <Input
            label="Notes"
            name="notes"
            type="textarea"
            disabled={!isField("notes")}
            error={errors.notes?.message}
            {...register("notes")}
          />

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" variant="primary" loading={actionLoading}>
              Save Changes
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate(`/shipments/${id}`)}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditShipment;
