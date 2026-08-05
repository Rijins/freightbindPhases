import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FiSearch, FiX } from "react-icons/fi";
import useAuth from "../../hooks/useAuth";
import { useRoleTheme } from "../../contexts/RoleThemeContext";
import { getRoleNavGroups } from "../../utils/helpers";
import { resolveModuleAccent } from "../../utils/themeTokens";

const MAX_RESULTS = 6;

const highlightMatch = (label, query, accentText) => {
  if (!query.trim()) return label;
  const start = label.toLowerCase().indexOf(query.toLowerCase());
  if (start === -1) return label;
  return (
    <>
      {label.slice(0, start)}
      <span className={accentText}>{label.slice(start, start + query.length)}</span>
      {label.slice(start + query.length)}
    </>
  );
};

const SearchResults = ({ results, query, activeIndex, onHover, onChoose }) => (
  <ul role="listbox" aria-label="Search results">
    {results.length === 0 ? (
      <li className="px-4 py-6 text-center text-xs text-slate-500 dark:text-zinc-400">
        No pages match “{query}”.
      </li>
    ) : (
      results.map((item, index) => {
        const Icon = item.icon;
        const isActive = index === activeIndex;
        return (
          <li key={`${item.to}-${index}`} role="option" aria-selected={isActive}>
            <button
              type="button"
              onMouseEnter={() => onHover(index)}
              onClick={() => onChoose(item)}
              className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                isActive
                  ? "bg-slate-100 text-slate-900 dark:bg-zinc-800 dark:text-white"
                  : "text-slate-600 dark:text-zinc-300"
              }`}
            >
              <Icon size={16} className="shrink-0 text-slate-400" />
              <span className="min-w-0 flex-1 truncate">
                {highlightMatch(item.label, query, resolveModuleAccent(item.to).text)}
              </span>
              <span className="shrink-0 text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                {item.group}
              </span>
            </button>
          </li>
        );
      })
    )}
  </ul>
);

/**
 * Global navigation search — searches the role-aware menu and navigates on
 * selection. Purely client-side over real routes: no fake data, no API call.
 * Inline on large screens, full-width overlay on smaller ones (Ctrl/Cmd+K or "/").
 */
const SearchPanel = ({ variant = "inline", inputRef, onClose }) => {
  const { user } = useAuth();
  const { primary } = useRoleTheme();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(variant === "overlay");
  const [activeIndex, setActiveIndex] = useState(0);

  const results = useMemo(() => {
    const flattened = getRoleNavGroups(user?.role).flatMap((group) =>
      group.items.map((item) => ({ ...item, group: group.label }))
    );
    if (!query.trim()) return flattened.slice(0, MAX_RESULTS);
    const needle = query.trim().toLowerCase();
    return flattened
      .filter((item) => item.label.toLowerCase().includes(needle))
      .slice(0, MAX_RESULTS);
  }, [query, user?.role]);

  useEffect(() => setActiveIndex(0), [query]);

  // Inline dropdown closes on outside interaction.
  useEffect(() => {
    if (variant !== "inline") return;
    const handlePointerDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [variant]);

  const handleKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && results[activeIndex]) {
      chooseItem(results[activeIndex]);
    } else if (event.key === "Escape") {
      if (variant === "overlay") onClose?.();
      else setIsOpen(false);
    }
  };

  const chooseItem = (item) => {
    navigate(item.to);
    setQuery("");
    onClose?.();
  };

  const inputClasses = `w-full rounded-lg border border-slate-200 bg-slate-100/80 py-2 pl-9 pr-4 text-sm text-slate-900 outline-none transition-colors placeholder-slate-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500 ${primary.inputRing}`;

  if (variant === "overlay") {
    return (
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900"
      >
        <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3 dark:border-zinc-800">
          <FiSearch size={18} className="shrink-0 text-slate-400" />
          <input
            autoFocus
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search pages…"
            aria-label="Global search"
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder-slate-400 dark:text-white dark:placeholder-zinc-500"
          />
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800 dark:hover:text-white"
            aria-label="Close search"
          >
            <FiX size={16} />
          </button>
        </div>
        <SearchResults
          results={results}
          query={query}
          activeIndex={activeIndex}
          onHover={setActiveIndex}
          onChoose={chooseItem}
        />
      </motion.div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <FiSearch
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
      <input
        ref={inputRef}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Search pages…"
        role="searchbox"
        aria-label="Global search"
        className={inputClasses}
      />
      <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 sm:flex">
        {navigator.platform.includes("Mac") ? "⌘K" : "Ctrl K"}
      </kbd>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 right-0 top-full z-50 mt-2 max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-xl scrollbar-thin dark:border-zinc-700 dark:bg-zinc-900"
          >
            <SearchResults
              results={results}
              query={query}
              activeIndex={activeIndex}
              onHover={setActiveIndex}
              onChoose={chooseItem}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const GlobalSearch = () => {
  const { primary } = useRoleTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const inlineInputRef = useRef(null);

  // Ctrl/Cmd+K opens the search — focus the inline input on desktop, the
  // overlay anywhere else.
  useEffect(() => {
    const handleShortcut = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (window.matchMedia("(min-width: 1024px)").matches) inlineInputRef.current?.focus();
        else setMobileOpen(true);
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  return (
    <>
      <div className="hidden flex-1 justify-center px-6 lg:flex">
        <SearchPanel variant="inline" inputRef={inlineInputRef} />
      </div>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className={`flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white lg:hidden ${primary.focusRing}`}
        aria-label="Open global search"
      >
        <FiSearch size={18} />
      </button>
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-zinc-950/70 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute inset-x-4 top-16">
              <SearchPanel variant="overlay" onClose={() => setMobileOpen(false)} />
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GlobalSearch;
