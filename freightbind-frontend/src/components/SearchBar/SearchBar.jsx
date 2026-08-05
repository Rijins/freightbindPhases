import { useEffect, useRef, useState } from "react";
import { FiLoader, FiSearch, FiX } from "react-icons/fi";
import useDebounce from "../../hooks/useDebounce";
import { useRoleTheme } from "../../contexts/RoleThemeContext";
import { cn } from "../../utils/cn";

/**
 * Reusable debounced search input. Calls onChange only after the user
 * pauses typing — never fires a request on every keystroke.
 *
 * Extras over the base input: optional `loading` spinner, a clear button,
 * and a `shortcutHint` (rendered as a hidden kbd pill) that focuses the
 * input via the given key combo (e.g. "mod+k").
 */
const SearchBar = ({
  value = "",
  onChange,
  placeholder = "Search...",
  debounceMs = 400,
  loading = false,
  shortcut,
  className = "",
  size = "md",
}) => {
  const roleTheme = useRoleTheme();
  const inputRef = useRef(null);
  const [term, setTerm] = useState(value);
  const debouncedTerm = useDebounce(term, debounceMs);

  useEffect(() => {
    setTerm(value);
  }, [value]);

  useEffect(() => {
    if (debouncedTerm !== value) {
      onChange?.(debouncedTerm);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedTerm]);

  useEffect(() => {
    if (!shortcut) return;
    const [modKey, key] = shortcut.toLowerCase().split("+");

    const onKeyDown = (e) => {
      const modPressed = modKey === "mod" ? e.metaKey || e.ctrlKey : e.shiftKey;
      if (modPressed && e.key.toLowerCase() === key) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [shortcut]);

  const canClear = debouncedTerm.length > 0 || term.length > 0;

  return (
    <div className={cn("relative w-full", size === "lg" ? "" : "sm:max-w-xs", className)}>
      <FiSearch
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
        size={16}
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        type="text"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={cn(
          "w-full rounded-[14px] border border-slate-300 bg-white pl-9 text-sm text-slate-800 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-slate-100 dark:placeholder:text-slate-500",
          size === "sm" ? "h-8 pr-7 text-xs" : "h-10 pr-9",
          canClear && !loading ? "pr-16" : "",
          roleTheme.primary.inputRing
        )}
      />
      {loading ? (
        <FiLoader
          size={15}
          className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-slate-400 dark:text-slate-500"
          aria-label="Searching"
        />
      ) : canClear ? (
        <button
          type="button"
          onClick={() => {
            setTerm("");
            inputRef.current?.focus();
          }}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-zinc-800 dark:hover:text-slate-300"
        >
          <FiX size={14} aria-hidden="true" />
        </button>
      ) : shortcut ? (
        <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 hidden items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 sm:inline-flex dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-500">
          {shortcut.split("+").map((part, i) => (
            <span key={i}>{part === "mod" ? "Ctrl" : part.toUpperCase()}</span>
          ))}
        </kbd>
      ) : null}
    </div>
  );
};

export default SearchBar;