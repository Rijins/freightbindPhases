import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

/** Reusable pagination bar driven entirely by backend pagination metadata. */
const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  onPageChange,
  itemLabel = "records",
}) => {
  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  const buttonClasses =
    "inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent dark:border-zinc-700 dark:text-slate-300 dark:hover:bg-zinc-800";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-1 py-3">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Page <span className="font-medium text-slate-700 dark:text-slate-200">{currentPage}</span> of{" "}
        <span className="font-medium text-slate-700 dark:text-slate-200">{totalPages || 1}</span>
        {typeof totalItems === "number" && (
          <span className="hidden sm:inline"> · {totalItems} total {itemLabel}</span>
        )}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={!canPrev}
          onClick={() => onPageChange(currentPage - 1)}
          className={buttonClasses}
        >
          <FiChevronLeft size={16} />
          Previous
        </button>
        <button
          type="button"
          disabled={!canNext}
          onClick={() => onPageChange(currentPage + 1)}
          className={buttonClasses}
        >
          Next
          <FiChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
