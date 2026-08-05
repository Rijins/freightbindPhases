import { motion } from "framer-motion";
import { cn } from "../../utils/cn";
import useModuleAccent from "../../hooks/useModuleAccent";

/**
 * Page-level header: optional icon, title, subtitle and an action cluster.
 * Lays out stacked on mobile and side-by-side on larger screens. The icon
 * tile picks up the current module accent, matching the breadcrumb.
 */
const PageHeader = ({ title, subtitle, actions, icon: Icon, className = "" }) => {
  const accent = useModuleAccent();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}
    >
      <div className="flex min-w-0 items-start gap-3">
        {Icon && (
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-zinc-800">
            <Icon size={20} className={accent.text} aria-hidden="true" />
          </span>
        )}
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">{actions}</div>
      )}
    </motion.div>
  );
};

export default PageHeader;