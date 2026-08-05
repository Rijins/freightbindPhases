import Skeleton from "./Skeleton";
import { cn } from "../../utils/cn";

/** Placeholder for a form panel — labelled fields stacked with a submit row. */
const SkeletonForm = ({ fields = 3, className = "" }) => (
  <div
    className={cn(
      "space-y-5 rounded-2xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900",
      className
    )}
  >
    {Array.from({ length: fields }, (_, f) => (
      <div key={f} className="space-y-2">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-10 w-full" />
      </div>
    ))}
    <div className="flex items-center justify-end gap-3 pt-2">
      <Skeleton className="h-9 w-24" />
      <Skeleton className="h-9 w-32" />
    </div>
  </div>
);

export default SkeletonForm;