import { FiLoader } from "react-icons/fi";
import { useRoleTheme } from "../../contexts/RoleThemeContext";

const SIZE_MAP = { sm: 16, md: 24, lg: 36 };

/**
 * Single reusable loading indicator. Use `fullPage` for route-level loads,
 * or drop it inline for tables / forms / buttons.
 */
const Loader = ({ size = "md", label, fullPage = false, className = "" }) => {
  const roleTheme = useRoleTheme();
  const content = (
    <div
      className={`flex flex-col items-center justify-center gap-2 text-slate-500 dark:text-slate-400 ${className}`}
    >
      <FiLoader
        className={`animate-spin ${roleTheme.primary.text}`}
        size={SIZE_MAP[size]}
        aria-hidden="true"
      />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );

  if (fullPage) {
    return <div className="flex min-h-[60vh] w-full items-center justify-center">{content}</div>;
  }

  return content;
};

export default Loader;
