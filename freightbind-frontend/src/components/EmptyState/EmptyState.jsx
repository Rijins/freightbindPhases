import { motion } from "framer-motion";
import { FiInbox } from "react-icons/fi";
import { useRoleTheme } from "../../contexts/RoleThemeContext";
import { cn } from "../../utils/cn";
import { fadeInUp } from "../../animations";

const SIZES = {
  sm: { icon: 28, tile: "h-14 w-14 rounded-2xl" },
  md: { icon: 36, tile: "h-16 w-16 rounded-2xl" },
  lg: { icon: 44, tile: "h-20 w-20 rounded-3xl" },
};

/**
 * Empty state — the "no data yet / filtered everything out" message. Icon tile
 * uses the role's soft accent so it stays on-brand without shouting.
 */
const EmptyState = ({
  icon: Icon = FiInbox,
  title,
  description,
  action,
  size = "md",
  className = "",
}) => {
  const roleTheme = useRoleTheme();
  const { icon: iconSize, tile } = SIZES[size] || SIZES.md;

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className={cn("flex flex-col items-center justify-center px-6 py-12 text-center", className)}
    >
      <div
        className={cn(
          "mb-4 flex items-center justify-center",
          roleTheme.primary.softBg,
          tile
        )}
      >
        <Icon size={iconSize} className={roleTheme.primary.text} aria-hidden="true" />
      </div>
      {title && <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">{title}</h3>}
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
};

export default EmptyState;