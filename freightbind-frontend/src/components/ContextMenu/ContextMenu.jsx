import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../../utils/cn";
import { EASE } from "../../animations";

/**
 * ContextMenu — right-click menu positioned at the cursor. Items share the
 * same shape as DropdownMenu. Closes on any click, Escape or a new contextmenu.
 */
const ContextMenu = ({ items = [], children, menuClassName = "" }) => {
  const [state, setState] = useState({ open: false, x: 0, y: 0 });
  const menuRef = useRef(null);

  const openMenu = (e) => {
    e.preventDefault();
    const x = Math.min(e.clientX, window.innerWidth - 220);
    const y = Math.min(e.clientY, window.innerHeight - 260);
    setState({ open: true, x, y });
  };

  useEffect(() => {
    if (!state.open) return undefined;
    const onPointerDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setState((s) => ({ ...s, open: false }));
    };
    const onContextMenu = () => setState((s) => ({ ...s, open: false }));
    const onKeyDown = (e) => {
      if (e.key === "Escape") setState((s) => ({ ...s, open: false }));
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [state.open]);

  return (
    <>
      <div onContextMenu={openMenu}>{children}</div>
      <AnimatePresence>
        {state.open && (
          <motion.ul
            ref={menuRef}
            role="menu"
            style={{ left: state.x, top: state.y }}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.15, ease: EASE }}
            className={cn(
              "fixed z-[60] min-w-48 list-none rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10 dark:border-zinc-800 dark:bg-zinc-900",
              menuClassName
            )}
          >
            {items.map((item, index) =>
              item.divider ? (
                <div key={index} className="my-1 h-px bg-slate-100 dark:bg-zinc-800" />
              ) : (
                <li key={index}>
                  <button
                    type="button"
                    role="menuitem"
                    disabled={item.disabled}
                    onClick={() => {
                      item.onClick?.();
                      setState((s) => ({ ...s, open: false }));
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors",
                      item.danger
                        ? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                        : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-zinc-800",
                      item.disabled && "pointer-events-none opacity-50"
                    )}
                  >
                    {item.icon && <item.icon size={15} aria-hidden="true" />}
                    {item.label}
                  </button>
                </li>
              )
            )}
          </motion.ul>
        )}
      </AnimatePresence>
    </>
  );
};

export default ContextMenu;