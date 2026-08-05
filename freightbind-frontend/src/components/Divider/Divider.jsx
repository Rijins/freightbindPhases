import { cn } from "../../utils/cn";

/**
 * Divider — a hairline separator. Pass `label` to render a subtle
 * centre-label version, or `orientation="vertical"` for inline divides.
 */
const Divider = ({ orientation = "horizontal", label, className = "" }) => {
  if (orientation === "vertical") {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={cn("w-px self-stretch bg-slate-200 dark:bg-zinc-800", className)}
      />
    );
  }

  if (label) {
    return (
      <div role="separator" className={cn("flex items-center gap-3", className)}>
        <span className="h-px flex-1 bg-slate-200 dark:bg-zinc-800" />
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {label}
        </span>
        <span className="h-px flex-1 bg-slate-200 dark:bg-zinc-800" />
      </div>
    );
  }

  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={cn("h-px w-full bg-slate-200 dark:bg-zinc-800", className)}
    />
  );
};

export default Divider;