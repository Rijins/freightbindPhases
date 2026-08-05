import { motion } from "framer-motion";
import Button from "../Button/Button";
import Skeleton from "../Skeleton/Skeleton";
import { useRoleTheme } from "../../contexts/RoleThemeContext";
import { cn } from "../../utils/cn";
import { EASE } from "../../animations";

/**
 * HeroSection — premium gradient banner for command-center style pages.
 * Role-themed (never hardcoded colors), glass stat tiles, optional action
 * buttons, and a soft staggered entrance. No decorative extras beyond a
 * blurred halo so it stays fast.
 *
 * Props: eyebrow, title, description, actions [{ label, icon, onClick, primary }],
 *   stats [{ label, value, icon }], loading, className.
 */
const HeroSection = ({
  eyebrow,
  title = "Command Center",
  description,
  actions = [],
  stats = [],
  loading = false,
  className = "",
}) => {
  const roleTheme = useRoleTheme();

  if (loading) {
    return (
      <div
        className={cn(
          "rounded-[24px] border border-slate-200 bg-white p-6 shadow-panel dark:border-zinc-800 dark:bg-zinc-900 sm:p-8",
          className
        )}
      >
        <Skeleton className="h-3 w-32" />
        <Skeleton className="mt-3 h-8 w-64" />
        <Skeleton className="mt-2 h-4 w-full max-w-md" />
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE }}
      className={cn(
        "relative overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-panel dark:border-zinc-800 dark:bg-zinc-900",
        className
      )}
    >
      <div
        className={cn("pointer-events-none absolute inset-x-0 top-0 h-1.5", roleTheme.primary.gradient)}
        aria-hidden="true"
      />
      <div
        className={cn(
          "pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-25 blur-3xl dark:opacity-40",
          roleTheme.primary.softBg
        )}
        aria-hidden="true"
      />

      <div className="relative p-6 sm:p-8">
        {eyebrow && (
          <p className={cn("text-xs font-semibold uppercase tracking-widest", roleTheme.primary.text)}>
            {eyebrow}
          </p>
        )}

        <h1 className="mt-2 font-display text-2xl font-semibold text-slate-900 dark:text-white sm:text-3xl">
          {title}
        </h1>

        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}

        {actions.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2.5">
            {actions.map((action) => (
              <Button
                key={action.label}
                variant={action.primary ? "primary" : "outline"}
                size="md"
                icon={action.icon}
                onClick={action.onClick}
                disabled={action.disabled}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}

        {stats.length > 0 && (
          <dl className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className={cn(
                  "rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/40"
                )}
              >
                <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {stat.label}
                </dt>
                <dd className="mt-1 flex items-center gap-1.5 font-display text-xl font-semibold text-slate-900 dark:text-white">
                  {stat.icon && <stat.icon size={16} className={roleTheme.primary.icon} aria-hidden="true" />}
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </motion.section>
  );
};

export default HeroSection;
