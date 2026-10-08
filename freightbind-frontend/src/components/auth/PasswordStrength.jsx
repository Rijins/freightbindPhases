import { useMemo } from "react";
import { cn } from "../../utils/cn";

/**
 * Advisory-only password strength meter. Mirrors the backend's minimum
 * (>= 6 characters) and adds length/variety heuristics on top — it never
 * blocks submission and never introduces a new password policy.
 * The label is always visible text (not color-only) for accessibility.
 */
const computeStrength = (password) => {
  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password) && /[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) {
    return { label: "Weak", bar: "bg-red-400", text: "text-red-500 dark:text-red-400", filled: 1 };
  }
  if (score === 2) {
    return { label: "Medium", bar: "bg-amber-400", text: "text-amber-600 dark:text-amber-400", filled: 2 };
  }
  return { label: "Strong", bar: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", filled: 3 };
};

const PasswordStrength = ({ password = "" }) => {
  const level = useMemo(() => computeStrength(password), [password]);

  if (!password) return null;

  return (
    <div className="mt-2" role="status" aria-live="polite">
      <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-1.5" aria-hidden="true">
          {[0, 1, 2].map((index) => (
            <span
              key={index}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors duration-200",
                index < level.filled ? level.bar : "bg-slate-200 dark:bg-zinc-700"
              )}
            />
          ))}
        </div>
        <span className={cn("text-xs font-medium", level.text)}>
          Password strength: {level.label}
        </span>
      </div>
    </div>
  );
};

export default PasswordStrength;
