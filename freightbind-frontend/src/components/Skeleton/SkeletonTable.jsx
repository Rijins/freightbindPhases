import Skeleton from "./Skeleton";
import { cn } from "../../utils/cn";

/** Placeholder for data tables — header row plus `rows` body rows. */
const SkeletonTable = ({ rows = 5, columns = 5, className = "" }) => (
  <div
    className={cn(
      "overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-900",
      className
    )}
  >
    <div className="flex items-center gap-4 border-b border-slate-100 bg-slate-50 px-5 py-3 dark:border-zinc-800 dark:bg-zinc-800/50">
      {Array.from({ length: columns }, (_, i) => (
        <Skeleton key={i} className="h-3.5 flex-1" />
      ))}
    </div>
    {Array.from({ length: rows }, (_, r) => (
      <div
        key={r}
        className={cn(
          "flex items-center gap-4 px-5 py-4",
          r !== rows - 1 && "border-b border-slate-100 dark:border-zinc-800"
        )}
      >
        {Array.from({ length: columns }, (_, c) => (
          <Skeleton key={c} className="h-3.5 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export default SkeletonTable;