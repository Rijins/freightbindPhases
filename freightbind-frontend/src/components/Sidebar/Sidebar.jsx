import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiChevronsLeft, FiChevronsRight, FiX } from "react-icons/fi";
import useAuth from "../../hooks/useAuth";
import useMediaQuery from "../../hooks/useMediaQuery";
import { useRoleTheme } from "../../contexts/RoleThemeContext";
import SidebarMenu from "./SidebarMenu";
import SidebarUserCard from "./SidebarUserCard";

const SIDEBAR_EXPANDED_WIDTH = 256;
const SIDEBAR_COLLAPSED_WIDTH = 76;
const MOBILE_BREAKPOINT = "(min-width: 768px)";

/**
 * One reusable sidebar for every authenticated page.
 * - Desktop/tablet: animated rail that collapses to icon-only via `collapsed`/`onCollapse`.
 * - Mobile: slide-over drawer controlled by `mobileOpen`/`onClose`.
 * Only one variant is mounted at a time so the shared layoutId active
 * indicator never animates between two competing instances.
 *
 * Light mode: white surface with right border. Dark mode: zinc-900.
 */
const Sidebar = ({ mobileOpen, onClose, collapsed, onCollapse }) => {
  const { user } = useAuth();
  const { primary } = useRoleTheme();
  const isDesktop = useMediaQuery(MOBILE_BREAKPOINT);

  // Esc closes the mobile drawer.
  useEffect(() => {
    if (!mobileOpen) return;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen, onClose]);

  const content = (isCollapsed) => (
    <div className="flex h-full w-full flex-col border-r border-slate-200 bg-white text-slate-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white">
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-4 dark:border-zinc-800">
        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="whitespace-nowrap font-display text-lg font-semibold tracking-tight"
            >
              FreightBind <span className={primary.text}>AI</span>
            </motion.span>
          )}
        </AnimatePresence>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white md:hidden"
            aria-label="Close navigation"
          >
            <FiX size={18} />
          </button>
          <button
            type="button"
            onClick={onCollapse}
            className="hidden h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white md:flex"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <FiChevronsRight size={18} /> : <FiChevronsLeft size={18} />}
          </button>
        </div>
      </div>

      <SidebarMenu collapsed={isCollapsed} onNavigate={onClose} />
      <SidebarUserCard collapsed={isCollapsed} user={user} />
    </div>
  );

  return (
    <>
      {isDesktop && (
        <motion.aside
          className="relative z-40 hidden h-screen shrink-0 md:block"
          initial={false}
          animate={{ width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          <div className="h-full overflow-y-auto scrollbar-thin">{content(collapsed)}</div>
        </motion.aside>
      )}

      {!isDesktop && (
        <AnimatePresence>
          {mobileOpen && (
            <div className="fixed inset-0 z-50 md:hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
              />
              <motion.aside
                initial={{ x: -SIDEBAR_EXPANDED_WIDTH }}
                animate={{ x: 0 }}
                exit={{ x: -SIDEBAR_EXPANDED_WIDTH }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="absolute inset-y-0 left-0 w-64"
              >
                {content(false)}
              </motion.aside>
            </div>
          )}
        </AnimatePresence>
      )}
    </>
  );
};

export default Sidebar;
