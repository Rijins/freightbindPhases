import Skeleton from "./Skeleton";
import { cn } from "../../utils/cn";

/** Placeholder for a Card — optional header bar plus content lines. */
const SkeletonCard = ({ header = true, lines = 3, className = "" }) => (
  <div
    className={cn(
      "rounded-2xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900",
      className
    )}
  >
    {header && (
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>
    )}
    <div className="space-y-3">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className={i === lines - 1 ? "h-3 w-2/3" : "h-3 w-full"} />
      ))}
    </div>
  </div>
);

export default SkeletonCard;