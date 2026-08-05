import { useSyncExternalStore, useState } from "react";
import { motion } from "framer-motion";
import { FiActivity, FiX } from "react-icons/fi";
import useSocket from "../../hooks/useSocket";
import { useSelector } from "react-redux";
import {
  getNotificationStats,
  subscribeNotificationStats,
} from "../../socket/notificationStats";
import { scaleIn } from "../../animations";

const STATUS_DOT = Object.freeze({
  connected: "bg-emerald-500",
  connecting: "bg-amber-500 animate-pulse",
  reconnecting: "bg-amber-500 animate-pulse",
  disconnected: "bg-rose-500",
});

// Dev-only snapshot of the realtime notification listener (see
// socket/notificationStats.js). Renders a dash before any notification event
// has been observed for this session.
const formatNotificationTime = (ts) => {
  if (!ts) return "—";
  return new Date(ts).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const formatSyncTime = (ts) => {
  if (!ts) return "—";
  return new Date(ts).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

/**
 * Development-only realtime inspector. Shows status, socket id, transport,
 * reconnect attempts, live notification metrics fed by the realtime
 * notification listener, plus Phase 7 Part 5 dashboard-sync metrics (shipment
 * updates received, dashboard updates applied, last dashboard sync time) fed
 * by the dashboard slice. Loaded via a dynamic import guarded by
 * import.meta.env.DEV, so the production bundle drops it entirely.
 */
const SocketDebug = () => {
  const [open, setOpen] = useState(false);
  const { status, socketId, transport, reconnectAttempts } = useSocket();
  const unreadCount = useSelector((state) => state.notifications?.unreadCount ?? 0);
  const dashboard = useSelector((state) => state.dashboard);
  const { received, applied, lastNotificationAt } = useSyncExternalStore(
    subscribeNotificationStats,
    getNotificationStats
  );

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open socket debug panel"
        aria-expanded={false}
        title="Socket debug (dev)"
        className="fixed bottom-4 left-4 z-50 inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-lg hover:text-slate-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <FiActivity size={16} aria-hidden="true" />
      </button>
    );
  }

  const rows = [
    { label: "Status", value: status, dot: STATUS_DOT[status] },
    { label: "Socket ID", value: socketId || "—" },
    { label: "Transport", value: transport || "—" },
    { label: "Reconnect attempts", value: String(reconnectAttempts) },
  ];

  const notificationRows = [
    { label: "Notifications received", value: String(received) },
    { label: "Emitted (Redux)", value: String(applied) },
    { label: "Unread count", value: String(unreadCount) },
    { label: "Last notification", value: formatNotificationTime(lastNotificationAt) },
  ];

  // Phase 7 Part 5: dashboard synchronization metrics (dev-only, fed by the
  // dashboard slice — zero cost in production logs).
  const dashboardRows = [
    { label: "Dashboard updates", value: String(dashboard?.updatesReceived ?? 0) },
    { label: "Shipment updates", value: String(dashboard?.shipmentUpdates ?? 0) },
    { label: "Notification updates", value: String(dashboard?.notificationUpdates ?? 0) },
    { label: "Last dashboard sync", value: formatSyncTime(dashboard?.lastSyncAt) },
  ];

  return (
    <motion.div
      role="region"
      aria-label="Socket debug panel"
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      className="fixed bottom-4 left-4 z-50 w-60 rounded-lg border border-slate-200 bg-white p-3 text-xs shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="font-medium text-slate-700 dark:text-slate-200">Socket Debug</span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close socket debug panel"
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <FiX size={14} aria-hidden="true" />
        </button>
      </div>
      <dl className="space-y-1.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-2">
            <dt className="text-slate-500 dark:text-slate-400">{row.label}</dt>
            <dd className="flex items-center gap-1.5 font-mono text-slate-700 dark:text-slate-200">
              {row.dot && <span className={`h-1.5 w-1.5 rounded-full ${row.dot}`} aria-hidden="true" />}
              {row.value}
            </dd>
          </div>
        ))}

        <div className="!my-2 border-t border-slate-100 dark:border-zinc-800" aria-hidden="true" />

        {notificationRows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-2">
            <dt className="text-slate-500 dark:text-slate-400">{row.label}</dt>
            <dd className="font-mono text-slate-700 dark:text-slate-200">{row.value}</dd>
          </div>
        ))}

        <div className="!my-2 border-t border-slate-100 dark:border-zinc-800" aria-hidden="true" />

        {dashboardRows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-2">
            <dt className="text-slate-500 dark:text-slate-400">{row.label}</dt>
            <dd className="font-mono text-slate-700 dark:text-slate-200">{row.value}</dd>
          </div>
        ))}
      </dl>
    </motion.div>
  );
};

export default SocketDebug;