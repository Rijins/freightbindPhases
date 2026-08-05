import { useRoleTheme } from "../../contexts/RoleThemeContext";
import { cn } from "../../utils/cn";

const SIZES = {
  sm: 32,
  md: 44,
  lg: 56,
};

const STROKE = {
  sm: 4,
  md: 5,
  lg: 6,
};

/**
 * ProgressCircular — determinate circular progress drawn with SVG. The ring
 * uses the current role accent for the fill segment; the track is neutral.
 */
const ProgressCircular = ({
  value = 0,
  size = "md",
  showLabel = true,
  className = "",
  trackClassName = "",
  barClassName = "",
}) => {
  const roleTheme = useRoleTheme();
  const clamped = Math.min(100, Math.max(0, Number(value) || 0));
  const dimension = SIZES[size] || SIZES.md;
  const stroke = STROKE[size] || STROKE.md;
  const radius = (dimension - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (clamped / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={dimension} height={dimension} role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100}>
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className={cn("stroke-slate-100 dark:stroke-zinc-800", trackClassName)}
        />
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${dimension / 2} ${dimension / 2})`}
          style={{ stroke: roleTheme.primary.chart }}
          className={cn(
            "transition-[stroke-dashoffset] duration-300 ease-out",
            barClassName
          )}
        />
      </svg>
      {showLabel && (
        <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold tabular-nums text-slate-700 dark:text-slate-200">
          {Math.round(clamped)}%
        </span>
      )}
    </div>
  );
};

export default ProgressCircular;