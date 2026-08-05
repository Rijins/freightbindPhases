import { cn } from "../../utils/cn";

const SIDES = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

/**
 * Tooltip — pure CSS, shows on hover and keyboard focus, respects reduced
 * motion by only fading opacity (no transform when motion is reduced is left
 * to Tailwind's motion-reduce variants).
 */
const Tooltip = ({
  label,
  side = "top",
  children,
  className = "",
  tooltipClassName = "",
  delay = 150,
}) => {
  if (!label) return children;

  const sideClass = SIDES[side] || SIDES.top;

  return (
    <span
      className={cn("group relative inline-flex", className)}
      style={{ ["--tooltip-delay" ]: `${delay}ms` }}
    >
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute z-50 whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 dark:bg-zinc-700",
          sideClass,
          tooltipClassName
        )}
        style={{ transitionDelay: "var(--tooltip-delay)" }}
      >
        {label}
      </span>
    </span>
  );
};

export default Tooltip;