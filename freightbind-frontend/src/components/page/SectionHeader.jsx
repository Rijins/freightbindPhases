import { cn } from "../../utils/cn";

/** Lightweight section header with an optional action slot. */
const SectionHeader = ({ title, subtitle, action, className = "" }) => (
  <div
    className={cn(
      "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
      className
    )}
  >
    <div className="min-w-0">
      <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
      {subtitle && <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

export default SectionHeader;