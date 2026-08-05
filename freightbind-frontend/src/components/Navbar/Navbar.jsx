import { FiMenu, FiPackage } from "react-icons/fi";
import { useRoleTheme } from "../../contexts/RoleThemeContext";
import NotificationBell from "../notifications/NotificationBell";
import GlobalSearch from "../GlobalSearch/GlobalSearch";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import UserMenu from "./UserMenu";

/**
 * Premium glass navbar: brand, global search, notifications (real feature),
 * theme switch, and the user dropdown.
 */
const Navbar = ({ onToggleSidebar }) => {
  const { primary } = useRoleTheme();

  return (
    <header className="relative z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white/70 px-4 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/70 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white md:hidden"
          aria-label="Toggle navigation"
        >
          <FiMenu size={20} />
        </button>
        <div className="flex shrink-0 items-center gap-2.5">
          <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${primary.softBg}`}>
            <FiPackage size={18} className={primary.icon} />
          </span>
          <span className="whitespace-nowrap font-display text-base font-semibold tracking-tight text-slate-900 dark:text-white">
            FreightBind <span className={primary.text}>AI</span>
          </span>
        </div>
      </div>

      <GlobalSearch />

      <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
        <NotificationBell />
        <ThemeToggle />
        <div className="mx-1 hidden h-6 w-px bg-slate-200 dark:bg-zinc-800 sm:block" aria-hidden="true" />
        <UserMenu />
      </div>
    </header>
  );
};

export default Navbar;
