import { FiEye } from "react-icons/fi";
import { cn } from "../../utils/cn";

/**
 * PreviewBadge — small "Preview" token shown on panels backed by sample
 * data. Clearly separates simulated sections from real live ones so users
 * are never misled about data provenance.
 */
const PreviewBadge = ({ label = "Preview", className = "" }) => (
  <span
    className={cn(
      "inline-flex items-center gap-1 rounded-full border border-amber-300/60 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
      className
    )}
  >
    <FiEye size={10} aria-hidden="true" />
    {label}
  </span>
);

export default PreviewBadge;
