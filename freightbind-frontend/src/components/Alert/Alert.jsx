import { motion } from "framer-motion";
import { FiAlertCircle, FiAlertTriangle, FiCheckCircle, FiInfo, FiX } from "react-icons/fi";
import { cn } from "../../utils/cn";
import { EASE } from "../../animations";

const SEVERITIES = {
  success: {
    icon: FiCheckCircle,
    container: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300",
    close: "hover:bg-emerald-100 dark:hover:bg-emerald-500/20",
  },
  warning: {
    icon: FiAlertTriangle,
    container: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300",
    close: "hover:bg-amber-100 dark:hover:bg-amber-500/20",
  },
  info: {
    icon: FiInfo,
    container: "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-300",
    close: "hover:bg-sky-100 dark:hover:bg-sky-500/20",
  },
  error: {
    icon: FiAlertCircle,
    container: "border-red-200 bg-red-50 text-red-800 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300",
    close: "hover:bg-red-100 dark:hover:bg-red-500/20",
  },
};

/**
 * Inline alert — comes with a severity icon, optional title/description and
 * an optional dismiss button. Animated in; wrap in <AnimatePresence> at the
 * call site if the alert should also animate out.
 */
const Alert = ({
  severity = "info",
  title,
  children,
  dismissible = false,
  onClose,
  icon: CustomIcon,
  className = "",
}) => {
  const config = SEVERITIES[severity] || SEVERITIES.info;
  const Icon = CustomIcon || config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: EASE }}
      role="alert"
      className={cn(
        "relative flex items-start gap-3 overflow-hidden rounded-xl border px-4 py-3",
        config.container,
        className
      )}
    >
      <Icon size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        {title && <p className="text-sm font-semibold">{title}</p>}
        {children && <div className={cn("text-sm", title && "mt-0.5")}>{children}</div>}
      </div>
      {dismissible && onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss alert"
          className={cn(
            "-m-1 shrink-0 rounded-md p-1 text-current opacity-70 transition-colors hover:opacity-100",
            config.close
          )}
        >
          <FiX size={16} />
        </button>
      )}
    </motion.div>
  );
};

export default Alert;