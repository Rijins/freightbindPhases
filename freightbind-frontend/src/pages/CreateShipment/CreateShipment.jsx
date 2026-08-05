import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiArrowLeft } from "react-icons/fi";
import Card, { CardHeader } from "../../components/Card/Card";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import { createShipment, clearActionStatus } from "../../features/shipments/shipmentSlice";
import { SHIPMENT_PRIORITIES } from "../../utils/constants";

const optionalString = z.string().trim().optional().or(z.literal(""));

const createShipmentSchema = z
  .object({
    title: z.string().trim().min(1, "Shipment title is required"),
    description: optionalString,
    cargoType: z.string().trim().min(1, "Cargo type is required"),
    shipmentType: z.string().trim().min(1, "Shipment type is required"),
    origin: z.string().trim().min(1, "Origin is required"),
    destination: z.string().trim().min(1, "Destination is required"),
    priority: z.enum(SHIPMENT_PRIORITIES).optional().or(z.literal("")),
    weight: z.union([z.string().length(0), z.coerce.number().min(0, "Weight cannot be negative")]).optional(),
    estimatedDeparture: optionalString,
    estimatedArrival: optionalString,
    containerNumber: optionalString,
    vehicleNumber: optionalString,
    notes: optionalString,
    assignedDispatcher: optionalString,
  })
  .refine(
    (data) =>
      !data.estimatedDeparture ||
      !data.estimatedArrival ||
      new Date(data.estimatedArrival) >= new Date(data.estimatedDeparture),
    {
      message: "Estimated arrival cannot be before estimated departure",
      path: ["estimatedArrival"],
    }
  );

const priorityOptions = SHIPMENT_PRIORITIES.map((p) => ({ value: p, label: p }));

const CreateShipment = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { actionLoading, actionError } = useSelector((state) => state.shipments);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createShipmentSchema),
    defaultValues: {
      title: "",
      description: "",
      cargoType: "",
      shipmentType: "",
      origin: "",
      destination: "",
      priority: "",
      weight: "",
      estimatedDeparture: "",
      estimatedArrival: "",
      containerNumber: "",
      vehicleNumber: "",
      notes: "",
      assignedDispatcher: "",
    },
  });

  const onSubmit = async (values) => {
    dispatch(clearActionStatus());

    const payload = { ...values };
    Object.keys(payload).forEach((key) => {
      if (payload[key] === "") delete payload[key];
    });
    if (payload.weight !== undefined) payload.weight = Number(payload.weight);

    const result = await dispatch(createShipment(payload));
    if (createShipment.fulfilled.match(result)) {
      navigate(`/shipments/${result.payload._id}`, { replace: true });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <button
          type="button"
          onClick={() => navigate("/shipments")}
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-navy-900 mb-2 dark:text-zinc-400 dark:hover:text-white"
        >
          <FiArrowLeft size={14} /> Back to Shipments
        </button>
        <h1 className="text-2xl font-semibold text-navy-900 dark:text-white">Create Shipment</h1>
        <p className="text-sm text-slate-500 mt-1 dark:text-zinc-400">
          New shipments start in <span className="font-medium">Draft</span> status. Current
          location is set automatically by the backend.
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
        <CardHeader title="Shipment Details" subtitle="Fields marked with * are required." />
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input label="Title" name="title" required error={errors.title?.message} {...register("title")} />
            <Input
              label="Cargo Type"
              name="cargoType"
              required
              placeholder="e.g. Electronics, Perishables"
              error={errors.cargoType?.message}
              {...register("cargoType")}
            />
            <Input
              label="Shipment Type"
              name="shipmentType"
              required
              placeholder="e.g. Freight, Parcel"
              error={errors.shipmentType?.message}
              {...register("shipmentType")}
            />
            <Input
              label="Priority"
              name="priority"
              type="select"
              options={priorityOptions}
              placeholder="Defaults to Medium"
              error={errors.priority?.message}
              {...register("priority")}
            />
            <Input
              label="Origin"
              name="origin"
              required
              error={errors.origin?.message}
              {...register("origin")}
            />
            <Input
              label="Destination"
              name="destination"
              required
              error={errors.destination?.message}
              {...register("destination")}
            />
            <Input
              label="Estimated Departure"
              name="estimatedDeparture"
              type="datetime-local"
              error={errors.estimatedDeparture?.message}
              {...register("estimatedDeparture")}
            />
            <Input
              label="Estimated Arrival"
              name="estimatedArrival"
              type="datetime-local"
              error={errors.estimatedArrival?.message}
              {...register("estimatedArrival")}
            />
            <Input
              label="Weight (kg)"
              name="weight"
              type="number"
              step="0.01"
              min="0"
              error={errors.weight?.message}
              {...register("weight")}
            />
            <Input
              label="Container Number"
              name="containerNumber"
              error={errors.containerNumber?.message}
              {...register("containerNumber")}
            />
            <Input
              label="Vehicle Number"
              name="vehicleNumber"
              error={errors.vehicleNumber?.message}
              {...register("vehicleNumber")}
            />
            <Input
              label="Assigned Dispatcher (User ID)"
              name="assignedDispatcher"
              placeholder="Mongo ID of an active Carrier Dispatcher"
              error={errors.assignedDispatcher?.message}
              {...register("assignedDispatcher")}
            />
          </div>

          <Input
            label="Description"
            name="description"
            type="textarea"
            error={errors.description?.message}
            {...register("description")}
          />
          <Input
            label="Notes"
            name="notes"
            type="textarea"
            error={errors.notes?.message}
            {...register("notes")}
          />

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" variant="primary" loading={actionLoading}>
              Create Shipment
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate("/shipments")}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateShipment;
