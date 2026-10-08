import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FiMail, FiPhone, FiShield, FiUser } from "react-icons/fi";
import Modal from "../../../components/Modal/Modal";
import Input from "../../../components/Input/Input";
import PasswordInput from "../../../components/Input/PasswordInput";
import Button from "../../../components/Button/Button";
import Alert from "../../../components/Alert/Alert";
import HubSelect from "../../../components/HubSelect/HubSelect";
import hubService from "../../../services/hubService";
import { ROLES, ROLES_LIST, ROLE_DESCRIPTIONS } from "../../../utils/constants";
import { cn } from "../../../utils/cn";

const roleOptions = ROLES_LIST.map((role) => ({ value: role, label: role }));

const buildSchema = (mode) => {
  const base = {
    fullName: z.string().trim().min(1, "Full name is required"),
    email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
    phone: z.string().trim().optional(),
    role: z.string().min(1, "Select a role"),
  };

  if (mode === "create") {
    return z
      .object({
        ...base,
        password: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string().min(1, "Please confirm your password"),
      })
      .refine((data) => data.password === data.confirmPassword, {
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
  }

  return z.object(base);
};

/**
 * Create / edit user modal. Create mode requires a password (+ confirm);
 * edit mode never sends or exposes passwords. Role selector is a closed
 * select of the four official roles with a description under the field.
 */
const UserFormModal = ({
  open,
  mode,
  user,
  isSelf = false,
  submitting = false,
  apiError,
  onClose,
  onSubmit,
}) => {
  const isCreate = mode === "create";
  const isEdit = mode === "edit";

  const [hub, setHub] = useState("");
  const [hubDisplay, setHubDisplay] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(buildSchema(mode)),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      role: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      role: user?.role || "",
      password: "",
      confirmPassword: "",
    });
    const hubId = user?.hub?._id || user?.hub || "";
    setHub(hubId);
    // The user list does not populate the hub reference, so when editing an
    // operator's hub we fetch the hub document for display. Best-effort: a
    // stale/unreachable hub just renders the placeholder until reopened.
    if (mode === "edit" && hubId) {
      hubService
        .getHub(hubId)
        .then((hub) => setHubDisplay(hub))
        .catch(() => setHubDisplay(null));
    } else {
      setHubDisplay(null);
    }
  }, [open, mode, user, reset]);

  // Backend 409 (duplicate email) is surfaced on the email field so the
  // admin sees exactly where the conflict is. Form values are preserved —
  // nothing is reset on error.
  useEffect(() => {
    if (!apiError) {
      clearErrors("email");
      return;
    }
    if (apiError.status === 409) {
      setError("email", {
        type: "server",
        message: "An account with this email address already exists.",
      });
    }
  }, [apiError, setError, clearErrors]);

  // Editing the email clears any stale duplicate-email error so a corrected
  // value can be resubmitted without react-hook-form blocking on it.
  const emailValue = watch("email");
  useEffect(() => {
    clearErrors("email");
  }, [emailValue, clearErrors]);

  const selectedRole = watch("role");

  const submit = (values) => {
    const payload = {
      fullName: values.fullName,
      email: values.email,
      phone: values.phone || undefined,
      role: values.role,
    };
    if (isCreate) payload.password = values.password;
    // Hub assignment (edit mode, Hub Operators only): null explicitly clears
    // the assignment; omitting the field leaves it untouched. The backend
    // auto-clears the hub when the role is changed away from Hub Operator.
    if (isEdit && values.role === ROLES.HUB_OPERATOR) {
      payload.hub = hub || null;
    }
    onSubmit(payload);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isCreate ? "Create user" : "Edit user"}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            loading={submitting}
            onClick={handleSubmit(submit)}
          >
            {isCreate ? "Create user" : "Save changes"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {apiError && (
          <Alert
            severity="error"
            title={
              apiError.status === 409
                ? "User already exists"
                : isCreate
                ? "Unable to create user"
                : "Unable to update user"
            }
          >
            {apiError.status === 409
              ? "An account with this email address already exists. Please use a different email."
              : apiError.message || "Something went wrong. Please try again."}
            {apiError.errors?.length > 0 && (
              <ul className="mt-1 list-disc pl-4 text-xs">
                {apiError.errors.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            )}
          </Alert>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            placeholder="you@company.com"
            icon={FiMail}
            error={errors.email?.message}
            {...register("email")}
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
          <div>
            <Input
              label="Role"
              name="role"
              type="select"
              options={roleOptions}
              placeholder="Select a role"
              icon={FiShield}
              error={errors.role?.message}
              disabled={isSelf && mode === "edit"}
              {...register("role")}
            />
            {isSelf && mode === "edit" ? (
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                You cannot change your own role.
              </p>
            ) : (
              selectedRole &&
              ROLE_DESCRIPTIONS[selectedRole] && (
                <p
                  className={cn(
                    "mt-1 text-xs",
                    errors.role ? "text-red-500" : "text-slate-500 dark:text-slate-400"
                  )}
                >
                  {ROLE_DESCRIPTIONS[selectedRole]}
                </p>
              )
            )}
          </div>
        </div>

{isEdit && selectedRole === ROLES.HUB_OPERATOR && (
          <div className="sm:col-span-2">
            <HubSelect
              label="Hub"
              value={hub}
              displayHub={hubDisplay}
              onChange={(selectedHub) => {
                setHub(selectedHub?._id || "");
                setHubDisplay(selectedHub || null);
              }}
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
              The operational hub this operator manages. Remove the selection to unassign.
            </p>
          </div>
        )}

        {isCreate && (
          <div className="grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 dark:border-zinc-800 sm:grid-cols-2">
            <PasswordInput
              label="Password"
              name="password"
              placeholder="At least 6 characters"
              autoComplete="new-password"
              error={errors.password?.message}
              {...register("password")}
            />
            <PasswordInput
              label="Confirm password"
              name="confirmPassword"
              placeholder="Repeat your password"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />
          </div>
        )}
      </div>
    </Modal>
  );
};

export default UserFormModal;
