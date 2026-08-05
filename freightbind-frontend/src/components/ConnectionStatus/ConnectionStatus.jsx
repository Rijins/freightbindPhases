import { motion } from "framer-motion";
import useSocket from "../../hooks/useSocket";
import { scaleIn } from "../../animations";

const STATUS_PRESENTATION = Object.freeze({
  connected: { label: "Connected", dot: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
  connecting: { label: "Connecting", dot: "bg-amber-500 animate-pulse", text: "text-amber-600 dark:text-amber-400" },
  reconnecting: { label: "Reconnecting", dot: "bg-amber-500 animate-pulse", text: "text-amber-600 dark:text-amber-400" },
  disconnected: { label: "Disconnected", dot: "bg-rose-500", text: "text-rose-600 dark:text-rose-400" },
});

/**
 * Floating realtime indicator. Reusable anywhere; mounted once in AppLayout.
 * Neutral colors keep it role-agnostic; dark mode and ~200ms transitions
 * follow the design system. Screen-reader friendly via role="status".
 */
const ConnectionStatus = ({ className = "" }) => {
  const { status } = useSocket();
  const presentation = STATUS_PRESENTATION[status] || STATUS_PRESENTATION.disconnected;

  return (
    <motion.div
      key={status}
      role="status"
      aria-live="polite"
      aria-label={`Realtime connection: ${presentation.label}`}
      initial="hidden"
      animate="visible"
      variants={scaleIn}
      className={`fixed bottom-4 right-4 z-50 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium shadow-lg dark:border-zinc-700 dark:bg-zinc-900 ${className}`}
    >
      <span className={`h-2 w-2 rounded-full ${presentation.dot}`} aria-hidden="true" />
      <span className={`tabular-nums ${presentation.text}`}>{presentation.label}</span>
    </motion.div>
  );
};

export default ConnectionStatus;
