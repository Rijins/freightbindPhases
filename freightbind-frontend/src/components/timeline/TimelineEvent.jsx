import {
    FiPlusCircle,
    FiRefreshCw,
    FiMapPin,
    FiUserPlus,
    FiUserCheck,
    FiXCircle,
    FiCheckCircle,
    FiMessageSquare,
    FiActivity,
} from "react-icons/fi";
import { motion } from "framer-motion";
import StatusBadge from "../StatusBadge/StatusBadge";
import { formatDateTime } from "../../utils/helpers";
import { fadeInUp } from "../../animations";

// Icon + colour + label per event type. Single source of truth — never
// re-derive this mapping elsewhere.
const EVENT_META = {
    "Shipment Created": { icon: FiPlusCircle, color: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400", label: "Shipment Created" },
    "Status Updated": { icon: FiRefreshCw, color: "bg-harbor-100 text-harbor-700 dark:bg-harbor-500/10 dark:text-harbor-400", label: "Status Updated" },
    "Location Updated": { icon: FiMapPin, color: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400", label: "Location Updated" },
    "Dispatcher Assigned": { icon: FiUserPlus, color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400", label: "Dispatcher Assigned" },
    "Dispatcher Changed": { icon: FiUserCheck, color: "bg-amber-50 text-signal-amber dark:bg-amber-500/10 dark:text-amber-400", label: "Dispatcher Changed" },
    "Shipment Cancelled": { icon: FiXCircle, color: "bg-red-50 text-signal-rust dark:bg-red-500/10 dark:text-red-400", label: "Shipment Cancelled" },
    "Shipment Delivered": { icon: FiCheckCircle, color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400", label: "Shipment Delivered" },
    "Note Added": { icon: FiMessageSquare, color: "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300", label: "Note Added" },
};

const DEFAULT_META = { icon: FiActivity, color: "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300", label: "Event" };

/** Renders a single shipment timeline event. Reusable across the timeline list and any future summary views. */
const TimelineEvent = ({ event }) => {
    const meta = EVENT_META[event.eventType] || DEFAULT_META;
    const Icon = meta.icon;

    return (
        <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-panel hover:shadow-md transition-shadow duration-150 dark:border-zinc-800 dark:bg-zinc-900"
        >
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${meta.color}`}>
                <Icon size={18} aria-hidden="true" />
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold text-navy-900 dark:text-white">{meta.label}</h4>
                    <span className="text-xs text-slate-400 shrink-0 dark:text-zinc-500">{formatDateTime(event.createdAt)}</span>
                </div>

                <p className="mt-1 text-sm text-slate-600 break-words dark:text-zinc-300">{event.description}</p>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                    {event.statusBefore && event.statusAfter && (
                        <div className="flex items-center gap-1.5">
                            <StatusBadge status={event.statusBefore} />
                            <span className="text-slate-300 dark:text-zinc-600">→</span>
                            <StatusBadge status={event.statusAfter} />
                        </div>
                    )}
                    {event.location && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
                            <FiMapPin size={12} /> {event.location}
                        </span>
                    )}
                </div>

                <p className="mt-2 text-xs text-slate-400 dark:text-zinc-500">
                    {event.performedBy?.fullName || "Unknown user"}
                    {event.performedBy?.role && <span> · {event.performedBy.role}</span>}
                </p>
            </div>
        </motion.div>
    );
};

export default TimelineEvent;