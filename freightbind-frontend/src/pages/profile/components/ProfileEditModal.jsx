import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FiMail, FiPhone, FiUser } from "react-icons/fi";
import { useDispatch } from "react-redux";
import Modal from "../../../components/Modal/Modal";
import Input from "../../../components/Input/Input";
import Button from "../../../components/Button/Button";
import Alert from "../../../components/Alert/Alert";
import { updateUserProfile } from "../../../features/auth/authSlice";

const profileSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  phone: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || value.length <= 40, {
      message: "Phone number is too long",
    }),
});

/**
 * Edit Profile modal. Only whitelisted backend fields are editable
 * (fullName, phone) — role, status and email are never part of the form.
 * Closes only after a successful update; entered values are preserved on
 * failure so nothing is lost.
 */
const ProfileEditModal = ({ open, user, apiError = null, onClose, onSuccess, onError }) => {
  const dispatch = useDispatch();
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: "", phone: "" },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      fullName: user?.fullName || "",
      phone: user?.phone || "",
    });
  }, [open, user, reset]);

  const submit = async (values) => {
    if (saving) return;
    setSaving(true);
    try {
      const result = await dispatch(
        updateUserProfile({ fullName: values.fullName, phone: values.phone || null })
      );
      if (updateUserProfile.fulfilled.match(result)) {
        onSuccess();
      } else {
        onError(result.payload || { message: "Something went wrong. Please try again." });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        if (!saving) onClose();
      }}
      title="Edit Profile"
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" loading={saving} onClick={handleSubmit(submit)}>
            Save changes
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {apiError && (
          <Alert severity="error" title="Unable to update profile">
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
          label="Full name"
          name="fullName"
          placeholder="Jane Doe"
          icon={FiUser}
          error={errors.fullName?.message}
          {...register("fullName")}
        />

        <Input
          label="Email"
          name="email"
          type="email"
          icon={FiMail}
          value={user?.email || ""}
          disabled
          helper="Email address cannot be changed here."
        />

        <Input
          label="Phone (optional)"
          name="phone"
          type="tel"
          placeholder="+1 555 000 0000"
          icon={FiPhone}
          error={errors.phone?.message}
          {...register("phone")}
        />

        <p className="text-xs text-slate-400 dark:text-zinc-500">
          Role and account status are managed by administrators and cannot be changed here.
        </p>
      </div>
    </Modal>
  );
};

export default ProfileEditModal;
