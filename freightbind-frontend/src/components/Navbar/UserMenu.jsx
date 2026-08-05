import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FiChevronDown, FiLogOut } from "react-icons/fi";
import useAuth from "../../hooks/useAuth";
import { logoutUser } from "../../features/auth/authSlice";
import { useRoleTheme } from "../../contexts/RoleThemeContext";
import { getInitials } from "../../utils/helpers";

/** Compact profile dropdown in the navbar: identity, email, logout. */
const UserMenu = () => {
  const { user } = useAuth();
  const { primary } = useRoleTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login", { replace: true });
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setMenuOpen((value) => !value)}
        className={`flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 dark:hover:bg-zinc-800 ${primary.focusRing}`}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-label="User menu"
      >
        <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white ${primary.solidBg}`}>
          {getInitials(user?.fullName)}
        </span>
        <span className="hidden text-left leading-tight sm:block">
          <span className="block text-sm font-medium text-slate-900 dark:text-white">
            {user?.fullName}
          </span>
          <span className={`block text-xs ${primary.softText}`}>{user?.role}</span>
        </span>
        <FiChevronDown
          size={16}
          className={`text-slate-400 transition-transform duration-200 dark:text-zinc-500 ${
            menuOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute right-0 top-full z-50 mt-2 w-60 origin-top-right overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
            role="menu"
          >
            <div className="border-b border-slate-200 px-4 py-3 dark:border-zinc-800">
              <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                {user?.fullName}
              </p>
              <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-zinc-400">
                {user?.email}
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
              role="menuitem"
            >
              <FiLogOut size={16} />
              Log out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;
