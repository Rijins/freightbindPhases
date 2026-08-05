import { motion } from "framer-motion";
import useAuth from "../../hooks/useAuth";
import { useRoleTheme } from "../../contexts/RoleThemeContext";
import Card, { CardHeader } from "../Card/Card";
import Skeleton from "../Skeleton/Skeleton";
import { cn } from "../../utils/cn";
import { EASE, staggerContainer } from "../../animations";

/**
 * QuickActionsWidget — a grid of shortcut actions. Each action can restrict
 * itself to `roles`; anything not in the current user's role list is hidden
 * automatically (mirrors backend route gating).
 *
 * Props: actions, title, subtitle, loading, emptyMessage, columns, className.
 * actions: { id, label, icon, onClick, roles?, accent?, description?, disabled? }
 */
const QuickActionsWidget = ({
  actions = [],
  loading = false,
  title = "Quick Actions",
  subtitle,
  emptyMessage = "No actions available for your role.",
  columns = 2,
  className = "",
}) => {
  const { user } = useAuth();
  const roleTheme = useRoleTheme();
  const visible = actions.filter((a) => !a.roles || a.roles.includes(user?.role));

  const gridClass =
    columns === 1
      ? "grid-cols-1"
      : columns === 3
        ? "grid-cols-1 sm:grid-cols-3"
        : "grid-cols-1 sm:grid-cols-2";

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader title={title} subtitle={subtitle} />

      {loading ? (
        <div className={cn("grid gap-3", gridClass)} aria-busy="true">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-[92px] rounded-[20px]" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
          {emptyMessage}
        </p>
      ) : (
        <motion.div
          variants={staggerContainer(0.04)}
          initial="hidden"
          animate="visible"
          className={cn("grid gap-3", gridClass)}
        >
          {visible.map((action) => (
            <motion.button
              key={action.id}
              type="button"
              onClick={action.onClick}
              disabled={action.disabled}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2, ease: EASE }}
              className={cn(
                "group flex items-start gap-3 rounded-[20px] border border-slate-200/80 bg-white p-4 text-left transition-colors shadow-none hover:shadow-panel hover:border-slate-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700",
                action.disabled && "cursor-not-allowed opacity-60"
              )}
            >
              {action.icon && (
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors",
                    action.accent || cn(roleTheme.primary.softBg, roleTheme.primary.softText)
                  )}
                >
                  <action.icon size={18} aria-hidden="true" />
                </span>
              )}
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                  {action.label}
                </span>
                {action.description && (
                  <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
                    {action.description}
                  </span>
                )}
              </span>
            </motion.button>
          ))}
        </motion.div>
      )}
    </Card>
  );
};

export default QuickActionsWidget;