import { FiFilter, FiX } from "react-icons/fi";
import SearchBar from "../SearchBar/SearchBar";
import Chip from "../Chip/Chip";
import { cn } from "../../utils/cn";

/**
 * FilterBar — a controlled filter cluster: optional debounced search field,
 * single-select dropdowns and chip multi-selects, plus an active-count
 * indicator and reset action. Holds no data — all state lives with the caller.
 *
 * Props: filters, searchValue, onSearchChange, searchPlaceholder, searchLoading,
 *   onFilterChange(key, value), onReset, resetLabel, className.
 * filters: [{ key, label, type: 'select' | 'chips', options, value }]
 *   — select: value is a single string; chips: value is an array.
 */
const FilterBar = ({
  filters = [],
  searchValue = "",
  onSearchChange,
  searchPlaceholder,
  onFilterChange,
  onReset,
  resetLabel = "Reset",
  className = "",
}) => {
  const activeCount = filters.filter((f) => {
    if (Array.isArray(f.value)) return f.value.length > 0;
    return f.value !== "" && f.value != null && f.value !== "all" && f.value !== "__all__";
  }).length;

  const toggleChip = (filter, value) => {
    if (!onFilterChange) return;
    const current = Array.isArray(filter.value) ? filter.value : [];
    onFilterChange(
      filter.key,
      current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
    );
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {searchPlaceholder && (
        <SearchBar value={searchValue} onChange={onSearchChange} placeholder={searchPlaceholder} />
      )}

      {filters.map((filter) =>
        filter.type === "chips" || Array.isArray(filter.value) ? (
          <div key={filter.key} className="flex flex-wrap items-center gap-2">
            {filter.options?.map((opt) => {
              const active = (filter.value || []).includes(opt.value);
              return (
                <Chip
                  key={opt.value}
                  label={opt.label}
                  tone={active ? opt.tone || "blue" : "slate"}
                  selected={active}
                  onSelect={() => toggleChip(filter, opt.value)}
                />
              );
            })}
          </div>
        ) : (
          <select
            key={filter.key}
            value={filter.value ?? ""}
            onChange={(e) => onFilterChange?.(filter.key, e.target.value)}
            aria-label={filter.label}
            className="h-10 min-w-[8.5rem] rounded-[14px] border border-slate-300 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-slate-100"
          >
            <option value="">{filter.label}</option>
            {filter.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )
      )}

      {activeCount > 0 && (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
          <FiFilter size={12} aria-hidden="true" />
          {activeCount} active
        </span>
      )}

      {activeCount > 0 && onReset && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 rounded-[14px] bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:bg-zinc-800 dark:text-slate-300 dark:hover:bg-zinc-700"
        >
          <FiX size={14} aria-hidden="true" />
          {resetLabel}
        </button>
      )}
    </div>
  );
};

export default FilterBar;