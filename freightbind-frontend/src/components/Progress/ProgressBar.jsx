import { useRoleTheme } from "../../contexts/RoleThemeContext";
import { cn } from "../../utils/cn";

const SIZES = {
  sm: "h-1.5",
  md: "h-2",
  lg: "h-2.5",
};

/**
 * ProgressBar — linear progress with an optional label. The track stays
 * neutral; the fill uses the role accent so it reads as native to whatever
 * module hosts it.
 */
const ProgressBar = ({
  value = 0,
  size = "md",
  label,
  showValue = false,
  className = "",
  barClassName = "",
}) => {
  const roleTheme = useRoleTheme();
  const clamped = Math.min(100, Math.max(0, Number(value) || 0));

  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="mb-1.5 flex items-center justify-between">
          {label && <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>}
          {showValue && (
            <span className="text-xs font-medium tabular-nums text-slate-500 dark:text-slate-400">
              {Math.round(clamped)}%
            </span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        className={cn("w-full overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800", SIZES[size])}
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-300 ease-out",
            roleTheme.primary.dot,
            barClassName
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;