import { forwardRef } from "react";
import { FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { useRoleTheme } from "../../contexts/RoleThemeContext";
import { cn } from "../../utils/cn";

const BASE_FIELD =
  "w-full rounded-[14px] border bg-white text-sm text-slate-800 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:text-slate-400 dark:bg-zinc-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:disabled:bg-zinc-800/50";

// Padding is resolved explicitly so the leading icon, trailing slot and the
// validation indicator never fight over the same class (px vs pl/pr order).
const resolvePadding = ({ icon, trailing, error, success }) => {
  const left = icon ? "pl-10" : "pl-3.5";
  const right = trailing || error || success ? "pr-10" : "pr-3.5";
  return `${left} ${right}`;
};

const buildFieldClasses = (roleTheme, { error, success, icon, trailing }, className = "") =>
  cn(
    BASE_FIELD,
    resolvePadding({ icon, trailing, error, success }),
    error
      ? "border-red-300 focus:border-red-500 focus:ring-red-500/30 dark:border-red-500/40"
      : success
      ? "border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/30 dark:border-emerald-500/40"
      : `border-slate-300 dark:border-zinc-700 ${roleTheme.primary.inputRing}`,
    className
  );

const iconPositionClasses = (isTextarea) =>
  isTextarea ? "top-3" : "top-1/2 -translate-y-1/2";

/**
 * Reusable input: consistent height, role-accented focus ring, theme support,
 * optional leading icon, trailing slot (e.g. password toggle, clear button)
 * and accessible error / success / helper states.
 */
const Input = forwardRef(
  (
    {
      label,
      name,
      type = "text",
      required = false,
      error,
      success = false,
      helper,
      icon: LeadingIcon,
      trailing,
      options = [],
      placeholder,
      className = "",
      rows = 3,
      ...rest
    },
    ref
  ) => {
    const roleTheme = useRoleTheme();
    const errorId = error ? `${name}-error` : undefined;
    const helperId = helper && !error ? `${name}-helper` : undefined;

    const isTextarea = type === "textarea";
    const fieldClasses = buildFieldClasses(roleTheme, { error, success, icon: LeadingIcon, trailing }, className);
    const inputClasses = `h-10 ${fieldClasses}`;
    const textareaClasses = `py-2.5 ${fieldClasses}`;

    const renderField = () => {
      if (type === "select") {
        return (
          <select
            id={name}
            name={name}
            ref={ref}
            className={inputClasses}
            aria-invalid={Boolean(error)}
            aria-describedby={cn(errorId, helperId)}
            {...rest}
          >
            <option value="">{placeholder || "Select an option"}</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      }

      if (isTextarea) {
        return (
          <textarea
            id={name}
            name={name}
            ref={ref}
            rows={rows}
            placeholder={placeholder}
            className={textareaClasses}
            aria-invalid={Boolean(error)}
            aria-describedby={cn(errorId, helperId)}
            {...rest}
          />
        );
      }

      return (
        <input
          id={name}
          name={name}
          type={type}
          ref={ref}
          placeholder={placeholder}
          className={inputClasses}
          aria-invalid={Boolean(error)}
          aria-describedby={cn(errorId, helperId)}
          {...rest}
        />
      );
    };

    const renderTrailing = () => {
      if (trailing) return trailing;
      if (error) return <FiAlertCircle size={16} className="text-red-400" aria-hidden="true" />;
      if (success) return <FiCheckCircle size={16} className="text-emerald-400" aria-hidden="true" />;
      return null;
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={name}
            className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            {label}
            {required && <span className="ml-0.5 text-red-500">*</span>}
          </label>
        )}
        <div className="relative">
          {LeadingIcon && (
            <span
              className={cn(
                "pointer-events-none absolute left-3 text-slate-400 dark:text-zinc-500",
                iconPositionClasses(isTextarea)
              )}
              aria-hidden="true"
            >
              <LeadingIcon size={16} />
            </span>
          )}
          {renderField()}
          {renderTrailing() && (
            <span
              className={cn(
                "absolute right-3 flex items-center",
                iconPositionClasses(isTextarea)
              )}
              aria-hidden={!trailing}
            >
              {renderTrailing()}
            </span>
          )}
        </div>
        {error ? (
          <p id={errorId} className="mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
            {error}
          </p>
        ) : helper ? (
          <p
            id={helperId}
            className={cn(
              "mt-1 text-xs",
              success ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"
            )}
          >
            {helper}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;