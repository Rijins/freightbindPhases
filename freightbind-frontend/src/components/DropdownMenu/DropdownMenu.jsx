import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiChevronDown } from "react-icons/fi";
import { cn } from "../../utils/cn";
import { EASE } from "../../animations";

const ALIGN_CLASSES = {
  start: "left-0",
  end: "right-0",
};

/**
 * DropdownMenu — trigger + floating panel with click-outside and Escape to
 * close. `trigger` may be a node or a render callback receiving `open`.
 * `items` is a list of { label, icon, onClick, href, danger, disabled, divider }.
 */
const DropdownMenu = ({
  trigger,
  items = [],
  align = "start",
  triggerClassName = "",
  menuClassName = "",
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const renderItem = (item, index) => {
    const classes = cn(
      "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors",
      item.danger
        ? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
        : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-zinc-800",
      item.disabled && "pointer-events-none opacity-50"
    );

    const inner = (
      <>
        {item.icon && <item.icon size={15} aria-hidden="true" />}
        {item.label}
      </>
    );

    if (item.divider) {
      return <div key={index} className="mx-2 my-1 h-px bg-slate-100 dark:bg-zinc-800" />;
    }

    return (
      <li key={index}>
        {item.href ? (
          <a
            href={item.href}
            className={classes}
            role="menuitem"
            onClick={() => {
              setOpen(false);
              item.onClick?.();
            }}
          >
            {inner}
          </a>
        ) : (
          <button
            type="button"
            role="menuitem"
            disabled={item.disabled}
            className={classes}
            onClick={() => {
              setOpen(false);
              item.onClick?.();
            }}
          >
            {inner}
          </button>
        )}
      </li>
    );
  };

  return (
    <div ref={rootRef} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg text-sm font-medium text-slate-700 transition-colors hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-300 dark:hover:text-white",
          triggerClassName
        )}
      >
        {typeof trigger === "function" ? trigger(open) : trigger}
        <FiChevronDown
          size={14}
          aria-hidden="true"
          className={cn("transition-transform duration-150", open && "rotate-180")}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: EASE }}
            className={cn(
              "absolute z-50 mt-2 min-w-44 list-none overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/5 dark:border-zinc-800 dark:bg-zinc-900",
              ALIGN_CLASSES[align],
              menuClassName
            )}
          >
            {items.map(renderItem)}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DropdownMenu;