import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FiMapPin } from "react-icons/fi";
import Modal from "../../../components/Modal/Modal";
import Input from "../../../components/Input/Input";
import Button from "../../../components/Button/Button";
import Alert from "../../../components/Alert/Alert";
import { HUB_TYPES, HUB_STATUSES } from "../../../utils/constants";

export const hubFormSchema = z.object({
  name: z.string().trim().min(1, "Hub name is required"),
  location: z.string().trim().min(1, "Hub location is required"),
  type: z.enum(HUB_TYPES, { message: "Select a hub type" }),
  status: z.enum(HUB_STATUSES, { message: "Select a hub status" }),
  capacity: z.preprocess(
    (value) =>
      value === "" || value === null || value === undefined ? null : Number(value),
    z
      .union([
        z.number({ message: "Capacity must be a number" }).min(0, "Capacity cannot be negative"),
        z.null(),
      ])
      .optional()
  ),
});

const inputClasses =
  "w-full rounded-[14px] border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-harbor-400/40 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-200";

/**
 * Create / edit hub modal. Same RHF + Zod pattern as UserFormModal; the
 * modal is Admin-only (route is gated server-side).
 */
const HubFormModal = ({ mode, hub, submitting, error, onSubmit, onClose }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(hubFormSchema),
    defaultValues: {
      name: hub?.name || "",
      location: hub?.location || "",
      type: hub?.type || "",
      status: hub?.status || "active",
      capacity: hub?.capacity ?? "",
    },
  });

  return (
    <Modal
      open
      onClose={onClose}
      title={mode === "create" ? "Create hub" : "Edit hub"}
      description="Hubs are operational facilities (Port, Yard, Warehouse, Distribution) that shipments hand through."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="hub-name" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Hub name
          </label>
          <Input
            id="hub-name"
            placeholder="e.g. Kochi Port Hub"
            icon={FiMapPin}
            error={errors.name?.message}
            {...register("name")}
          />
        </div>

        <div>
          <label htmlFor="hub-location" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Location
          </label>
          <Input
            id="hub-location"
            placeholder="e.g. Willingdon Island, Kochi"
            error={errors.location?.message}
            {...register("location")}
          />
        </div>

        <div>
          <label htmlFor="hub-capacity" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Capacity <span className="font-normal text-slate-400 dark:text-slate-500">(optional)</span>
          </label>
          <Input
            id="hub-capacity"
            type="number"
            min="0"
            step="any"
            placeholder="e.g. 250 shipments"
            error={errors.capacity?.message}
            {...register("capacity")}
          />
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            Used to compute hub utilization on the dashboard. Leave empty to keep it unmeasured.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="hub-type" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Type
            </label>
            <select id="hub-type" className={inputClasses} {...register("type")}>
              <option value="">Select type</option>
              {HUB_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.type?.message && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.type.message}</p>}
          </div>

          <div>
            <label htmlFor="hub-status" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Status
            </label>
            <select id="hub-status" className={inputClasses} {...register("status")}>
              {HUB_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status === "active" ? "Active" : "Inactive"}
                </option>
              ))}
            </select>
            {errors.status?.message && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.status.message}</p>
            )}
          </div>
        </div>

        {error && (
          <Alert severity="error" title={mode === "create" ? "Unable to create hub" : "Unable to update hub"}>
            {error.message || "Something went wrong. Please try again."}
          </Alert>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {mode === "create" ? "Create Hub" : "Save Changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default HubFormModal;
