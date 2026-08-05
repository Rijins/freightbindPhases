import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiAlertTriangle, FiBell, FiCheckCircle, FiInfo, FiX } from "react-icons/fi";
import { cn } from "../../utils/cn";
import { EASE } from "../../animations";

const SEVERITIES = {
  success: {
    icon: FiCheckCircle,
    container: "border-emerald-200/80 bg-emerald-50 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300",
    close: "hover:bg-emerald-100 dark:hover:bg-emerald-500/20",
  },
  warning: {
    icon: FiAlertTriangle,
    container: "border-amber-200/80 bg-amber-50 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300",
    close: "hover:bg-amber-100 dark:hover:bg-amber-500/20",
  },
  critical: {
    icon: FiAlertTriangle,
    container: "border-red-200 bg-red-50 text-red-800 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300",
    close: "hover:bg-red-100 dark:hover:bg-red-500/20",
  },
  info: {
    icon: FiInfo,
    container: "border-sky-200/80 bg-sky-50 text-sky-800 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-300",
    close: "hover:bg-sky-100 dark:hover:bg-sky-500/20",
  },
  default: {
    icon: FiBell,
    container: "border-slate-200 bg-slate-50 text-slate-700 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-slate-300",
    close: "hover:bg-slate-100 dark:hover:bg-zinc-700/60",
  },
};

/**
 * AlertBanner — full-width status banner for page-level system messages
 * (maintenance, rate limits, action outcomes). Slides down into view; wraps
 * itself in AnimatePresence so it slides back out when dismissed.
 *
 * Props: severity, title, message?, dismissible (default true), onDismiss,
 *   action, className.
 */
const AlertBanner = ({
  severity = "info",
  title,
  message,
  dismissible = true,
  onDismiss,
  action,
  className = "",
}) => {
  const [visible, setVisible] = useState(true);
  const conf = SEVERITIES[severity] || SEVERITIES.default;
  const Icon = conf.icon;

  const handleClose = () => {
    setVisible(false);
    onDismiss?.();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="alert"
          initial={{ opacity: 0, y: -12, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -12, height: 0 }}
          transition={{ duration: 0.25, ease: EASE }}
          className={cn("overflow-hidden", className)}
        >
          <div
            className={cn(
              "flex items-start gap-3 rounded-[20px] border px-4 py-3 shadow-sm",
              conf.container
            )}
          >
            <Icon size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              {title && <p className="text-sm font-semibold">{title}</p>}
              {message && (
                <p className={cn("text-sm", title && "mt-0.5 opacity-90")}>{message}</p>
              )}
            </div>
            {action && <div className="shrink-0">{action}</div>}
            {dismissible && (
              <button
                type="button"
                onClick={handleClose}
                aria-label="Dismiss banner"
                className={cn(
                  "-m-1 shrink-0 rounded-lg p-1 text-current opacity-70 transition-colors",
                  conf.close
                )}
              >
                <FiX size={16} aria-hidden="true" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AlertBanner;