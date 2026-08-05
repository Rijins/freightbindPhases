import { motion } from "framer-motion";
import { useRoleTheme } from "../../contexts/RoleThemeContext";
import { cn } from "../../utils/cn";
import { cardHover } from "../../animations";

const SURFACE_CLASSES =
  "relative overflow-hidden rounded-[20px] border border-slate-200/80 bg-white shadow-panel dark:border-zinc-800 dark:bg-zinc-900";

/**
 * Base card surface. `interactive` renders as a motion element with a subtle
 * hover lift for clickable cards; role accents are opt-in via `accent`.
 */
const Card = ({
  children,
  className = "",
  padded = true,
  hoverable = false,
  interactive = false,
  accent = false,
  as: Tag = "div",
  ...rest
}) => {
  const roleTheme = useRoleTheme();

  if (interactive) {
    return (
      <motion.div
        whileHover={cardHover}
        className={cn(
          SURFACE_CLASSES,
          "cursor-pointer transition-shadow hover:shadow-panelHover",
          padded ? "p-5" : "",
          className
        )}
        {...rest}
      >
        {accent && <AccentBar roleTheme={roleTheme} />}
        {children}
      </motion.div>
    );
  }

  return (
    <Tag
      className={cn(
        SURFACE_CLASSES,
        "transition-shadow",
        padded ? "p-5" : "",
        hoverable ? "hover:shadow-panelHover" : "",
        className
      )}
      {...rest}
    >
      {accent && <AccentBar roleTheme={roleTheme} />}
      {children}
    </Tag>
  );
};

const AccentBar = ({ roleTheme }) => (
  <span className={`absolute inset-y-0 left-0 w-1 ${roleTheme.primary.dot}`} aria-hidden="true" />
);

export const CardHeader = ({ title, subtitle, action }) => (
  <div className="mb-4 flex items-start justify-between gap-4">
    <div>
      <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
      {subtitle && <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

export const CardBody = ({ children, className = "" }) => (
  <div className={cn("text-sm text-slate-600 dark:text-slate-300", className)}>{children}</div>
);

export const CardFooter = ({ children, className = "" }) => (
  <div
    className={cn(
      "flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-4 dark:border-zinc-800",
      className
    )}
  >
    {children}
  </div>
);

export default Card;