const SkeletonCard = () => (
    <div className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-panel animate-pulse dark:border-zinc-800 dark:bg-zinc-900">
        <div className="h-10 w-10 shrink-0 rounded-full bg-slate-200 dark:bg-zinc-800" />
        <div className="flex-1 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
                <div className="h-4 w-32 rounded bg-slate-200 dark:bg-zinc-800" />
                <div className="h-3 w-20 rounded bg-slate-100 dark:bg-zinc-800" />
            </div>
            <div className="h-3 w-3/4 rounded bg-slate-100 dark:bg-zinc-800" />
            <div className="h-3 w-1/3 rounded bg-slate-100 dark:bg-zinc-800" />
        </div>
    </div>
);

/** Loading skeleton for the timeline list — matches dashboard skeleton styling (subtle pulse, no jarring spinners). */
const TimelineLoading = ({ rows = 4 }) => (
    <div className="space-y-3" aria-busy="true" aria-label="Loading timeline">
        {Array.from({ length: rows }).map((_, i) => (
            <SkeletonCard key={i} />
        ))}
    </div>
);

export default TimelineLoading;
