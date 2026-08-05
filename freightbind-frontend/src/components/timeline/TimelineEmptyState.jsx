import { FiClock, FiRefreshCw } from "react-icons/fi";
import Button from "../Button/Button";

/** Empty state for the timeline list — used both for "no events yet" and "no events match your filters". */
const TimelineEmptyState = ({ onRefresh, refreshing = false, message = "No timeline events yet." }) => (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center dark:border-zinc-700 dark:bg-zinc-900">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-zinc-800 dark:text-zinc-500">
            <FiClock size={22} />
        </div>
        <p className="text-sm text-slate-500 max-w-sm dark:text-zinc-400">{message}</p>
        {onRefresh && (
            <Button variant="outline" size="sm" icon={FiRefreshCw} loading={refreshing} onClick={onRefresh}>
                Refresh
            </Button>
        )}
    </div>
);

export default TimelineEmptyState;