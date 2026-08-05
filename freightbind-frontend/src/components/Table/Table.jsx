import { motion } from "framer-motion";
import { FiArrowDown, FiArrowUp, FiInbox } from "react-icons/fi";
import { EASE } from "../../animations";
import Skeleton from "../Skeleton/Skeleton";
import Button from "../Button/Button";
import { cn } from "../../utils/cn";

/**
 * Reusable table: dynamic columns, backend-driven sorting, loading and
 * empty states, animated rows, optional sticky header and a footer slot.
 * Never build a page-specific table implementation — extend this one via
 * `columns`.
 *
 * columns: { key, label, sortable?, render?(row) }
 * footer: React node rendered under the table (e.g. Pagination).
 */
const Table = ({
  columns,
  data = [],
  loading = false,
  sortBy,
  order,
  onSortChange,
  emptyMessage = "No records found.",
  emptyAction,
  rowKey = "_id",
  sticky = false,
  animateRows = true,
  getRowClassName,
  footer,
  className = "",
}) => {
  const handleSort = (column) => {
    if (!column.sortable || !onSortChange) return;
    if (sortBy === column.key) {
      onSortChange(column.key, order === "asc" ? "desc" : "asc");
    } else {
      onSortChange(column.key, "asc");
    }
  };

  return (
    <div
      className={cn(
        "w-full overflow-x-auto scrollbar-thin rounded-xl border border-slate-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-900",
        className
      )}
    >
      <table className="w-full min-w-[720px] text-sm">
        <thead className={cn(sticky && "sticky top-0 z-10 bg-slate-50 dark:bg-zinc-800/60")}>
          <tr className="border-b border-slate-200 bg-slate-50 dark:border-zinc-800 dark:bg-zinc-800/60">
            {columns.map((col) => (
              <th
                key={col.key}
                aria-sort={
                  col.sortable && sortBy === col.key
                    ? order === "asc"
                      ? "ascending"
                      : "descending"
                    : undefined
                }
                onClick={() => handleSort(col)}
                onKeyDown={(e) => {
                  if (col.sortable && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    handleSort(col);
                  }
                }}
                tabIndex={col.sortable ? 0 : undefined}
                className={cn(
                  "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap dark:text-slate-400",
                  col.sortable &&
                    "cursor-pointer select-none hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:hover:text-white"
                )}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {col.sortable && sortBy === col.key &&
                    (order === "asc" ? <FiArrowUp size={12} aria-hidden="true" /> : <FiArrowDown size={12} aria-hidden="true" />)}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr aria-busy="true">
              <td colSpan={columns.length} className="px-0 py-0">
                <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {[0, 1, 2, 3, 4].map((rowIndex) => (
                    <div key={rowIndex} className="flex items-center gap-4 px-4 py-3.5">
                      {columns.map((col) => (
                        <Skeleton key={col.key} className="h-3.5 flex-1" />
                      ))}
                    </div>
                  ))}
                </div>
              </td>
            </tr>
          )}

          {!loading && data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="py-14">
                <div className="flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
                  <FiInbox size={28} className="text-slate-300 dark:text-zinc-700" />
                  <p className="text-sm">{emptyMessage}</p>
                  {emptyAction && (
                    <Button variant="primary" size="sm" onClick={emptyAction.onClick}>
                      {emptyAction.label}
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          )}

          {!loading &&
            data.map((row, index) => {
              const cells = columns.map((col) => (
                <td
                  key={col.key}
                  className="px-4 py-3 align-middle whitespace-nowrap text-slate-700 dark:text-slate-200"
                >
                  {col.render ? col.render(row) : row[col.key] ?? "—"}
                </td>
              ));

              const rowClassName = cn(
                "border-b border-slate-100 last:border-0 hover:bg-slate-50/60 dark:border-zinc-800 dark:hover:bg-zinc-800/40",
                getRowClassName?.(row)
              );

              if (!animateRows) {
                return (
                  <tr key={row[rowKey]} className={rowClassName}>
                    {cells}
                  </tr>
                );
              }

              return (
                <motion.tr
                  key={`row-${row[rowKey]}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: EASE, delay: Math.min(index * 0.03, 0.3) }}
                  className={rowClassName}
                >
                  {cells}
                </motion.tr>
              );
            })}
        </tbody>
      </table>

      {footer && <div className="border-t border-slate-200 px-4 py-3 dark:border-zinc-800">{footer}</div>}
    </div>
  );
};

export default Table;