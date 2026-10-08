import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatePresence } from "framer-motion";
import { FiKey, FiLock } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import Card, { CardHeader, CardBody } from "../../../components/Card/Card";
import PasswordInput from "../../../components/Input/PasswordInput";
import Button from "../../../components/Button/Button";
import Alert from "../../../components/Alert/Alert";
import { changePassword, clearPasswordError } from "../../../features/auth/authSlice";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

/**
 * Change Password form. The backend verifies the current password before
 * changing anything — this form only collects the fields and renders
 * server errors (401 for a wrong current password, 422 for validation).
 * Passwords never enter Redux: only request status + an error message live
 * in the auth slice. The form resets only after a successful change.
 */
const SecurityTab = () => {
  const dispatch = useDispatch();
  const passwordLoading = useSelector((state) => state.auth.passwordLoading);
  const passwordError = useSelector((state) => state.auth.passwordError);

  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  useEffect(() => {
    return () => {
      dispatch(clearPasswordError());
    };
  }, [dispatch]);

  const submit = async (values) => {
    if (passwordLoading) return;
    setSuccess(false);
    const result = await dispatch(
      changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword })
    );
    if (changePassword.fulfilled.match(result)) {
      reset();
      setSuccess(true);
    }
  };

  return (
    <Card>
      <CardHeader
        title="Change Password"
        subtitle="Your current password is verified by the server before the change is applied."
        action={
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-slate-400">
            <FiKey size={16} aria-hidden="true" />
          </span>
        }
      />
      <CardBody>
        <AnimatePresence>
          {success && (
            <div className="mb-4">
              <Alert severity="success" title="Password changed" dismissible onClose={() => setSuccess(false)}>
                Your password has been updated. Use the new password the next time you log in.
              </Alert>
            </div>
          )}
          {passwordError && (
            <div className="mb-4">
              <Alert
                severity="error"
                title={
                  passwordError.status === 401
                    ? "Current password is incorrect"
                    : "Unable to change password"
                }
                dismissible
                onClose={() => dispatch(clearPasswordError())}
              >
                {passwordError.status === 401
                  ? "The current password you entered does not match our records."
                  : passwordError.message || "Something went wrong. Please try again."}
                {passwordError.errors?.length > 0 && (
                  <ul className="mt-1 list-disc pl-4 text-xs">
                    {passwordError.errors.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                )}
              </Alert>
            </div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <div className="max-w-md">
            <PasswordInput
              label="Current password"
              name="currentPassword"
              placeholder="Enter your current password"
              autoComplete="current-password"
              icon={FiLock}
              error={errors.currentPassword?.message}
              {...register("currentPassword")}
            />
          </div>
          <div className="max-w-md">
            <PasswordInput
              label="New password"
              name="newPassword"
              placeholder="At least 6 characters"
              autoComplete="new-password"
              icon={FiLock}
              error={errors.newPassword?.message}
              {...register("newPassword")}
            />
          </div>
          <div className="max-w-md">
            <PasswordInput
              label="Confirm new password"
              name="confirmPassword"
              placeholder="Repeat your new password"
              autoComplete="new-password"
              icon={FiLock}
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />
          </div>
          <div className="flex max-w-md items-center justify-end border-t border-slate-100 pt-4 dark:border-zinc-800">
            <Button type="submit" variant="primary" loading={passwordLoading}>
              Update password
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
};

export default SecurityTab;
