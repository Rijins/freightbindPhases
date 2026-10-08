import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FiCalendar, FiFlag, FiMessageSquare, FiType } from "react-icons/fi";
import Modal from "../../../components/Modal/Modal";
import Input from "../../../components/Input/Input";
import Button from "../../../components/Button/Button";
import Alert from "../../../components/Alert/Alert";
import { ANNOUNCEMENT_PRIORITIES, ANNOUNCEMENT_STATUSES } from "../../../utils/constants";
import { toDateTimeInputValue } from "../../../utils/helpers";

const priorityOptions = ANNOUNCEMENT_PRIORITIES.map((priority) => ({ value: priority, label: priority }));
const statusOptions = ANNOUNCEMENT_STATUSES.map((status) => ({
  value: status,
  label: status === "active" ? "Active (publish now)" : "Inactive (draft)",
}));

const optionalDate = z
  .string()
  .optional()
  .transform((value) => (value ? new Date(value).toISOString() : undefined));

const buildSchema = () =>
  z
    .object({
      title: z.string().trim().min(1, "Title is required"),
      message: z.string().trim().min(1, "Message is required"),
      priority: z.string().min(1, "Select a priority"),
      status: z.string().min(1, "Select a status"),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.startDate && data.endDate && new Date(data.endDate) < new Date(data.startDate)) {
        ctx.addIssue({
          code: "custom",
          path: ["endDate"],
          message: "End date must be on or after the start date",
        });
      }
    });

/**
 * Create / edit announcement modal (Admin only). Dates are stored as ISO
 * strings; an empty end date means "no expiry". Activating (or creating with
 * status active) publishes the announcement to every user immediately.
 */
const AnnouncementFormModal = ({
  open,
  mode,
  announcement,
  submitting = false,
  apiError,
  onClose,
  onSubmit,
}) => {
  const isCreate = mode === "create";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(buildSchema()),
    defaultValues: {
      title: "",
      message: "",
      priority: "Medium",
      status: "inactive",
      startDate: "",
      endDate: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      title: announcement?.title || "",
      message: announcement?.message || "",
      priority: announcement?.priority || "Medium",
      status: announcement?.status || "inactive",
      startDate: toDateTimeInputValue(announcement?.startDate),
      endDate: toDateTimeInputValue(announcement?.endDate),
    });
  }, [open, mode, announcement, reset]);

  const submit = (values) => {
    const payload = {
      title: values.title,
      message: values.message,
      priority: values.priority,
      status: values.status,
      startDate: values.startDate || undefined,
      endDate: values.endDate || undefined,
    };
    onSubmit(payload);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isCreate ? "Create Announcement" : "Edit Announcement"}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" loading={submitting} onClick={handleSubmit(submit)}>
            {isCreate ? "Create announcement" : "Save changes"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {apiError && (
          <Alert severity="error" title="Unable to save announcement">
            {apiError.message || "Something went wrong. Please try again."}
            {apiError.errors?.length > 0 && (
              <ul className="mt-1 list-disc pl-4 text-xs">
                {apiError.errors.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            )}
          </Alert>
        )}

        <Input
          label="Title"
          name="title"
          placeholder="e.g. Scheduled maintenance window"
          icon={FiType}
          error={errors.title?.message}
          {...register("title")}
        />

        <Input
          label="Message"
          name="message"
          type="textarea"
          rows={4}
          placeholder="What do users need to know?"
          icon={FiMessageSquare}
          error={errors.message?.message}
          {...register("message")}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Priority"
            name="priority"
            type="select"
            options={priorityOptions}
            icon={FiFlag}
            error={errors.priority?.message}
            {...register("priority")}
          />
          <Input
            label="Status"
            name="status"
            type="select"
            options={statusOptions}
            error={errors.status?.message}
            {...register("status")}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Start date (optional)"
            name="startDate"
            type="datetime-local"
            icon={FiCalendar}
            error={errors.startDate?.message}
            helper="Defaults to now when empty."
            {...register("startDate")}
          />
          <Input
            label="End date (optional)"
            name="endDate"
            type="datetime-local"
            icon={FiCalendar}
            error={errors.endDate?.message}
            helper="Leave empty for no expiry."
            {...register("endDate")}
          />
        </div>

        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          Saving with status “Active” publishes the announcement immediately and sends it to every
          active user. Inactive announcements stay hidden until activated.
        </p>
      </div>
    </Modal>
  );
};

export default AnnouncementFormModal;
