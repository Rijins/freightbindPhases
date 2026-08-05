import { motion } from "framer-motion";
import { FiAlertCircle, FiRefreshCw } from "react-icons/fi";
import { cn } from "../../utils/cn";
import { fadeInUp } from "../../animations";

/**
 * Error state — full-panel "something broke" message with an optional retry.
 * Complements EmptyState for the zero-data case.
 */
const ErrorState = ({
  icon: Icon = FiAlertCircle,
  title = "Something went wrong",
  description,
  detail,
  onRetry,
  retryLabel = "Try again",
  className = "",
}) => (
  <motion.div
    variants={fadeInUp}
    initial="hidden"
    animate="visible"
    role="alert"
    className={cn("flex flex-col items-center justify-center px-6 py-12 text-center", className)}
  >
    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-500/10">
      <Icon size={36} className="text-red-500 dark:text-red-400" aria-hidden="true" />
    </div>
    <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
    {description && (
      <p className="mt-1.5 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>
    )}
    {detail && (
      <pre className="mt-3 max-w-md overflow-x-auto rounded-lg bg-slate-100 px-3 py-2 text-left text-xs text-slate-500 dark:bg-zinc-800 dark:text-slate-400">
        {detail}
      </pre>
    )}
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3.5 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-500/30 dark:bg-zinc-900 dark:text-red-400 dark:hover:bg-red-500/10"
      >
        <FiRefreshCw size={14} aria-hidden="true" />
        {retryLabel}
      </button>
    )}
  </motion.div>
);

export default ErrorState;