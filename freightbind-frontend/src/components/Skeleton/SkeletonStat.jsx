import Skeleton from "./Skeleton";
import { cn } from "../../utils/cn";

/** Placeholder for a StatCard — icon chip, big number and a label. */
const SkeletonStat = ({ className = "" }) => (
  <div
    className={cn(
      "flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900",
      className
    )}
  >
    <Skeleton className="h-10 w-10 rounded-xl" />
    <div className="space-y-2">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-3 w-16" />
    </div>
  </div>
);

export default SkeletonStat;