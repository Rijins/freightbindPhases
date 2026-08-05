import { FiX } from "react-icons/fi";
import { cn } from "../../utils/cn";

const TONES = {
  slate: "bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-300",
  blue: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
  indigo: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300",
  teal: "bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300",
  amber: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  red: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300",
  cyan: "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300",
  rose: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
  purple: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300",
};

/**
 * Chip — compact, tag-like token. Pass `onClose` to make it dismissible, or
 * `onSelect` to make it a selection chip (toggled look via `selected`).
 */
const Chip = ({
  tone = "slate",
  icon: Icon,
  label,
  onRemove,
  onSelect,
  selected = false,
  clickable = false,
  className = "",
}) => {
  const rootClass = cn(
    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors",
    TONES[tone] || TONES.slate,
    clickable || onSelect ? "cursor-pointer" : "",
    selected && "ring-1 ring-inset ring-current",
    className
  );

  const inner = (
    <span className={rootClass}>
      {Icon && <Icon size={12} aria-hidden="true" />}
      {onSelect ? (
        <span className="flex items-center gap-1.5">
          <span
            className={cn(
              "flex h-3 w-3 items-center justify-center rounded-sm border",
              selected ? "border-current bg-current text-white" : "border-slate-400"
            )}
          >
            {selected && (
              <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" fill="none" aria-hidden="true">
                <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
          {label}
        </span>
      ) : (
        label
      )}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label={`Remove ${label}`}
          className="rounded-full opacity-60 transition-opacity hover:opacity-100"
        >
          <FiX size={12} />
        </button>
      )}
    </span>
  );

  if (onSelect) {
    return (
      <button
        type="button"
        aria-pressed={selected}
        className="border-0 bg-transparent p-0"
        onClick={() => onSelect(!selected)}
      >
        {inner}
      </button>
    );
  }

  return <span className="inline-flex">{inner}</span>;
};

export default Chip;