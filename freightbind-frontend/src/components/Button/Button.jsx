import { FiLoader } from "react-icons/fi";
import { useRoleTheme } from "../../contexts/RoleThemeContext";

const BASE_CLASSES =
  "inline-flex items-center justify-center rounded-[14px] font-medium " +
  "transition-all duration-150 active:scale-[0.98] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-950 " +
  "disabled:cursor-not-allowed disabled:opacity-50";

const getVariantClasses = (variant, roleTheme) => {
  switch (variant) {
    case "primary":
      return `${roleTheme.primary.solidBg} hover:shadow ${roleTheme.primary.focusRing}`;
    case "secondary":
      return `${roleTheme.primary.softBg} ${roleTheme.primary.softText} ${roleTheme.primary.focusRing}`;
    case "danger":
      return "bg-red-600 text-white hover:bg-red-500 shadow-sm hover:shadow focus-visible:ring-red-500";
    case "success":
      return "bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm hover:shadow focus-visible:ring-emerald-500";
    case "outline":
      return "border border-slate-300 bg-transparent text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:text-slate-200 dark:hover:bg-zinc-800 focus-visible:ring-slate-400";
    case "ghost":
      return "bg-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-zinc-800 focus-visible:ring-slate-400";
    default:
      return getVariantClasses("primary", roleTheme);
  }
};

const SIZE_CLASSES = {
  sm: "px-3 py-1.5 text-sm gap-1.5",
  md: "px-4 py-2 text-sm gap-2",
  lg: "px-5 py-2.5 text-base gap-2",
};

/**
 * Role-aware button system. Primary/secondary pull their colors from the
 * current user's role theme; outline/ghost stay neutral; danger is semantic.
 */
const Button = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = false,
  type = "button",
  icon: Icon,
  className = "",
  onClick,
  ...rest
}) => {
  const roleTheme = useRoleTheme();

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${BASE_CLASSES} ${getVariantClasses(variant, roleTheme)} ${SIZE_CLASSES[size]} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
      {...rest}
    >
      {loading ? (
        <FiLoader className="animate-spin" size={16} aria-hidden="true" />
      ) : (
        Icon && <Icon size={16} aria-hidden="true" />
      )}
      {children}
    </button>
  );
};

export default Button;
