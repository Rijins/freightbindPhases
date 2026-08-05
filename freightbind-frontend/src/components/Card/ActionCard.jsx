import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import { useRoleTheme } from "../../contexts/RoleThemeContext";
import { cn } from "../../utils/cn";
import { EASE } from "../../animations";

/**
 * Interactive action card — icon tile, title, subtitle, optional trailing
 * actions and a prompt arrow. Built for quick actions on dashboards.
 */
const ActionCard = ({
  icon: Icon,
  title,
  subtitle,
  onClick,
  actions,
  disabled = false,
  className = "",
  ...rest
}) => {
  const roleTheme = useRoleTheme();
  const clickable = Boolean(onClick) && !disabled;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: EASE }}
      whileHover={clickable ? { y: -3 } : undefined}
      onClick={clickable ? onClick : undefined}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      className={cn(
        "group relative flex flex-col gap-4 overflow-hidden rounded-[20px] border border-slate-200/80 bg-white p-5 shadow-panel transition-shadow dark:border-zinc-800 dark:bg-zinc-900",
        clickable &&
          "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 hover:shadow-panelHover",
        disabled && "cursor-not-allowed opacity-60",
        className
      )}
      aria-disabled={disabled}
      {...rest}
    >
      <div className="flex items-start justify-between gap-3">
        {Icon && (
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${roleTheme.primary.softBg}`}
          >
            <Icon size={20} className={roleTheme.primary.softText} />
          </span>
        )}
        {clickable && (
          <FiArrowRight
            size={18}
            className="text-slate-300 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-slate-500 dark:text-zinc-600 dark:group-hover:text-zinc-300"
            aria-hidden="true"
          />
        )}
      </div>
      <div className="min-w-0">
        <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
        {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </motion.div>
  );
};

export default ActionCard;