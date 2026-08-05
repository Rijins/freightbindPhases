import { getInitials } from "../../utils/helpers";
import { cn } from "../../utils/cn";

const SIZES = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-14 w-14 text-lg",
};

const STATUS_DOTS = {
  online: { dot: "bg-emerald-500", ring: "ring-2 ring-white dark:ring-zinc-900" },
  offline: { dot: "bg-slate-400", ring: "ring-2 ring-white dark:ring-zinc-900" },
  away: { dot: "bg-amber-400", ring: "ring-2 ring-white dark:ring-zinc-900" },
  busy: { dot: "bg-red-500", ring: "ring-2 ring-white dark:ring-zinc-900" },
};

/**
 * Avatar — shows the user's image when provided, otherwise deterministic
 * initials on a neutral slate surface. Optionally shows a status dot.
 */
const Avatar = ({
  name = "",
  src,
  size = "md",
  status,
  className = "",
  ...rest
}) => {
  const sizeClass = SIZES[size] || SIZES.md;
  const compact = size === "xs" || size === "sm";

  return (
    <span className={cn("relative inline-flex shrink-0", className)} {...rest}>
      {src ? (
        <img
          src={src}
          alt={name || "Avatar"}
          loading="lazy"
          className={cn(
            "rounded-full object-cover",
            sizeClass,
            compact ? "" : "ring-1 ring-slate-200 dark:ring-zinc-700"
          )}
        />
      ) : (
        <span
          aria-hidden="true"
          className={cn(
            "flex items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 font-medium text-slate-700 dark:from-zinc-800 dark:to-zinc-700 dark:text-slate-200",
            sizeClass
          )}
        >
          {getInitials(name)}
        </span>
      )}
      {status && STATUS_DOTS[status] && (
        <span
          aria-label={status}
          title={status}
          className={cn(
            "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full",
            STATUS_DOTS[status].dot,
            STATUS_DOTS[status].ring
          )}
        />
      )}
    </span>
  );
};

export default Avatar;