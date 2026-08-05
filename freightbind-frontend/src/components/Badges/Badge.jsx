import { cn } from "../../utils/cn";

const SOFT_TONES = {
  slate: "bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400",
  blue: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  indigo: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
  teal: "bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400",
  amber: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  red: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  cyan: "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400",
  rose: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
  purple: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
  orange: "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
};

const OUTLINE_TONES = {
  slate: "text-slate-600 ring-slate-300 dark:text-slate-400 dark:ring-zinc-700",
  blue: "text-blue-600 ring-blue-300 dark:text-blue-400 dark:ring-blue-500/40",
  indigo: "text-indigo-600 ring-indigo-300 dark:text-indigo-400 dark:ring-indigo-500/40",
  teal: "text-teal-600 ring-teal-300 dark:text-teal-400 dark:ring-teal-500/40",
  amber: "text-amber-600 ring-amber-400 dark:text-amber-400 dark:ring-amber-500/40",
  emerald: "text-emerald-600 ring-emerald-300 dark:text-emerald-400 dark:ring-emerald-500/40",
  red: "text-red-600 ring-red-300 dark:text-red-400 dark:ring-red-500/40",
  cyan: "text-cyan-600 ring-cyan-300 dark:text-cyan-400 dark:ring-cyan-500/40",
  rose: "text-rose-600 ring-rose-300 dark:text-rose-400 dark:ring-rose-500/40",
  purple: "text-purple-600 ring-purple-300 dark:text-purple-400 dark:ring-purple-500/40",
  orange: "text-orange-600 ring-orange-300 dark:text-orange-400 dark:ring-orange-500/40",
};

const SIZE_CLASSES = {
  sm: "px-2.5 py-1 text-xs",
  md: "px-3 py-1 text-sm",
};

/**
 * Base badge — one visual style, semantic tones. Status, priority, role,
 * notification and timeline badges all build on this instead of duplicating
 * markup. `tone: "custom"` skips the built-in palette so role-colored classes
 * can be supplied directly via `className`.
 */
const Badge = ({
  tone = "slate",
  size = "sm",
  dot = false,
  outline = false,
  icon: Icon,
  children,
  className = "",
  ...rest
}) => {
  const base =
    tone === "custom"
      ? ""
      : outline
      ? OUTLINE_TONES[tone] || OUTLINE_TONES.slate
      : SOFT_TONES[tone] || SOFT_TONES.slate;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        SIZE_CLASSES[size],
        base,
        outline && tone !== "custom" ? "ring-1 ring-inset" : "",
        className
      )}
      {...rest}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />}
      {Icon && <Icon size={size === "md" ? 14 : 12} aria-hidden="true" />}
      {children}
    </span>
  );
};

export default Badge;