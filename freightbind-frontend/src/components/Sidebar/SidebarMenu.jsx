import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import useAuth from "../../hooks/useAuth";
import { useRoleTheme } from "../../contexts/RoleThemeContext";
import { getRoleNavGroups } from "../../utils/helpers";

const GROUP_VARIANTS = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const GROUP_ITEM_VARIANTS = {
  hidden: { opacity: 0, x: -6 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.2, ease: "easeOut" } },
};

/**
 * Role-aware grouped navigation. The active item gets an animated accent bar
 * (layoutId pill that slides between items) plus a role-specific icon tint.
 */
const SidebarMenu = ({ collapsed, onNavigate }) => {
  const { user } = useAuth();
  const roleGroups = getRoleNavGroups(user?.role);
  const { primary } = useRoleTheme();

  return (
    <motion.nav
      className="flex-1 space-y-5 overflow-y-auto px-3 py-4 scrollbar-thin"
      initial="hidden"
      animate="visible"
      variants={GROUP_VARIANTS}
      aria-label="Primary navigation"
    >
      {roleGroups.map((group) => (
        <div key={group.id} className="space-y-1">
          {collapsed ? (
            <div className="mx-2 mb-1 h-px bg-slate-200 dark:bg-zinc-800" aria-hidden="true" />
          ) : (
            <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              {group.label}
            </p>
          )}
          <motion.ul className="space-y-1" variants={GROUP_ITEM_VARIANTS}>
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === "/dashboard"}
                    onClick={onNavigate}
                    title={item.label}
                    aria-label={item.label}
                  >
                    {({ isActive }) => (
                      <span
                        className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                          isActive
                            ? primary.activePill
                            : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                        }`}
                      >
                        {isActive && (
                          <motion.span
                            layoutId="sidebar-active-indicator"
                            className={`absolute inset-y-2 left-0 w-1 rounded-full ${primary.solidBg}`}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        )}
                        <Icon
                          size={18}
                          className={`shrink-0 ${isActive ? primary.icon : "text-slate-400 dark:text-zinc-500"}`}
                        />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </span>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </motion.ul>
        </div>
      ))}
    </motion.nav>
  );
};

export default SidebarMenu;
