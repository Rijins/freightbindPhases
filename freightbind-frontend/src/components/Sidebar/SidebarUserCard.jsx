import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FiLogOut } from "react-icons/fi";
import { logoutUser } from "../../features/auth/authSlice";
import { useRoleTheme } from "../../contexts/RoleThemeContext";
import { getInitials } from "../../utils/helpers";

/** Bottom block of the sidebar: profile identity (role accent) + logout. */
const SidebarUserCard = ({ collapsed, user }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { primary } = useRoleTheme();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login", { replace: true });
  };

  return (
    <div className="shrink-0 border-t border-slate-200 p-3 dark:border-zinc-800">
      <div className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-slate-100 dark:hover:bg-zinc-800/60">
        <div className="relative shrink-0">
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white ${primary.solidBg}`}
          >
            {getInitials(user?.fullName)}
          </span>
          <span
            className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${primary.dot} dark:border-zinc-900`}
            aria-hidden="true"
          />
        </div>
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="min-w-0 flex-1 overflow-hidden text-left"
            >
              <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                {user?.fullName}
              </p>
              <p className={`truncate text-xs ${primary.softText}`}>{user?.role}</p>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          type="button"
          onClick={handleLogout}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white ${primary.focusRing}`}
          aria-label="Log out"
          title="Log out"
        >
          <FiLogOut size={16} />
        </button>
      </div>
      {!collapsed && (
        <p className="mt-2 px-2 text-[11px] text-slate-400 dark:text-zinc-600">
          © {new Date().getFullYear()} FreightBind AI
        </p>
      )}
    </div>
  );
};

export default SidebarUserCard;
