import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiAlertCircle, FiCheck, FiChevronDown, FiMapPin, FiRefreshCw, FiSearch, FiX } from "react-icons/fi";
import Badge from "../Badges/Badge";
import Skeleton from "../Skeleton/Skeleton";
import hubService from "../../services/hubService";
import useDebounce from "../../hooks/useDebounce";
import { useRoleTheme } from "../../contexts/RoleThemeContext";
import { HUB_STATUS_BADGE_TONES } from "../../utils/helpers";
import { cn } from "../../utils/cn";

const PAGE_LIMIT = 50;

const BASE_TRIGGER =
  "w-full rounded-[14px] border bg-white text-sm transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 dark:bg-zinc-900 dark:text-slate-100 dark:disabled:bg-zinc-800/50";

const buildTriggerClasses = (roleTheme, { error, selected, disabled }, className = "") =>
  cn(
    BASE_TRIGGER,
    error
      ? "border-red-300 focus:border-red-500 focus:ring-red-500/30 dark:border-red-500/40"
      : "border-slate-300 dark:border-zinc-700",
    error ? "" : roleTheme.primary.inputRing,
    disabled ? "" : "hover:border-slate-400 dark:hover:border-zinc-600",
    selected ? "px-3 py-2 pr-12" : "h-10 px-3.5",
    className
  );

const HighlightName = ({ name, query, accentText }) => {
  if (!query.trim()) return name;
  const start = name.toLowerCase().indexOf(query.toLowerCase());
  if (start === -1) return name;
  return (
    <>
      {name.slice(0, start)}
      <span className={accentText}>{name.slice(start, start + query.length)}</span>
      {name.slice(start + query.length)}
    </>
  );
};

const HubRow = ({ hub, query, isActive, isSelected, accentText, onHover, onChoose }) => (
  <li
    role="option"
    id={`hub-option-${hub._id}`}
    aria-selected={isSelected}
    className={cn(
      "transition-colors",
      isActive ? "bg-slate-100 dark:bg-zinc-800" : "bg-transparent"
    )}
  >
    <button
      type="button"
      onMouseEnter={onHover}
      onClick={onChoose}
      className="flex w-full items-start gap-3 px-3 py-2.5 text-left"
    >
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400">
        <FiMapPin size={15} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-slate-900 dark:text-white">
          <HighlightName name={hub.name} query={query} accentText={accentText} />
        </span>
        <span className="block truncate text-xs text-slate-500 dark:text-zinc-400">{hub.location}</span>
        <span className="mt-1 flex flex-wrap items-center gap-1.5">
          <Badge tone="indigo">{hub.type}</Badge>
          <Badge tone={HUB_STATUS_BADGE_TONES[hub.status] || "slate"} dot>
            {hub.status === "active" ? "Active" : "Inactive"}
          </Badge>
        </span>
      </span>
      {isSelected && <FiCheck size={16} className="mt-2 shrink-0 text-emerald-500" aria-hidden="true" />}
    </button>
  </li>
);

/**
 * HubSelect — searchable combobox for picking an operational Hub during
 * shipment create/edit. Candidates come from GET /hubs (backend allows
 * Admin + Logistics Director). The raw Mongo ID is kept inside the form
 * value but is never rendered to the user.
 */
const HubSelect = ({
  label = "Relevant Hub",
  value = "",
  displayHub = null,
  onChange,
  error,
  disabled = false,
  className = "",
}) => {
  const roleTheme = useRoleTheme();

  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const searchRef = useRef(null);
  const requestSeq = useRef(0);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 400);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const fieldKey = label.toLowerCase().replace(/\s+/g, "-");
  const errorId = error ? `${fieldKey}-error` : undefined;
  const listId = `${fieldKey}-listbox`;

  const selectedHub =
    (value && candidates.find((candidate) => candidate._id === value)) ||
    (value && displayHub) ||
    null;

  const toggleDropdown = () => {
    if (disabled) return;
    setOpen((isOpen) => !isOpen);
  };

  const closeDropdown = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const chooseHub = (hub) => {
    onChange?.(hub);
    setQuery("");
    setOpen(false);
    triggerRef.current?.focus();
  };

  const clearHub = () => {
    onChange?.(null);
    setQuery("");
  };

  const retry = () => {
    requestSeq.current += 1;
    setFetchError(null);
    setLoading(true);
    hubService
      .listHubs({ search: debouncedQuery, page: 1, limit: PAGE_LIMIT })
      .then(({ hubs }) => {
        setCandidates(hubs);
        setLoading(false);
      })
      .catch(() => {
        setFetchError("Unable to load hubs");
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const seq = ++requestSeq.current;
    setLoading(true);
    setFetchError(null);

    hubService
      .listHubs({ search: debouncedQuery, page: 1, limit: PAGE_LIMIT })
      .then(({ hubs }) => {
        if (cancelled || requestSeq.current !== seq) return;
        setCandidates(hubs);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled || requestSeq.current !== seq) return;
        setFetchError("Unable to load hubs");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, debouncedQuery]);

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [candidates, debouncedQuery]);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  const handleSearchKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (candidates.length) setActiveIndex((index) => Math.min(index + 1, candidates.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (candidates[activeIndex]) chooseHub(candidates[activeIndex]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      closeDropdown();
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <span id={`${listId}-label`} className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </span>

      <div ref={containerRef} className="relative">
        {selectedHub ? (
          <button
            ref={triggerRef}
            type="button"
            disabled={disabled}
            onClick={toggleDropdown}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={open ? listId : undefined}
            aria-describedby={error ? errorId : undefined}
            aria-label={`${label}: ${selectedHub.name}`}
            className={buildTriggerClasses(roleTheme, { error, selected: true, disabled })}
          >
            <span className="flex min-w-0 items-start gap-3 text-left">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400">
                <FiMapPin size={15} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-slate-900 dark:text-white">
                  {selectedHub.name}
                </span>
                <span className="block truncate text-xs text-slate-500 dark:text-zinc-400">
                  {selectedHub.location}
                </span>
                <span className="mt-1 flex flex-wrap items-center gap-1.5">
                  <Badge tone="indigo">{selectedHub.type}</Badge>
                  <Badge tone={HUB_STATUS_BADGE_TONES[selectedHub.status] || "slate"} dot>
                    {selectedHub.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </span>
              </span>
            </span>
          </button>
        ) : (
          <button
            ref={triggerRef}
            type="button"
            disabled={disabled}
            onClick={toggleDropdown}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={open ? listId : undefined}
            aria-describedby={error ? errorId : undefined}
            aria-label={label}
            className={buildTriggerClasses(roleTheme, { error, selected: false, disabled })}
          >
            <span className="flex min-w-0 flex-1 items-center gap-2">
              <FiSearch size={16} className="shrink-0 text-slate-400 dark:text-zinc-500" aria-hidden="true" />
              <span className="truncate text-slate-400 dark:text-zinc-500">Search hub...</span>
            </span>
            <FiChevronDown
              size={16}
              className={cn(
                "shrink-0 text-slate-400 transition-transform dark:text-zinc-500",
                open && "rotate-180"
              )}
              aria-hidden="true"
            />
          </button>
        )}

        {selectedHub && !disabled && (
          <button
            type="button"
            onClick={clearHub}
            aria-label="Remove hub"
            className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800 dark:hover:text-white"
          >
            <FiX size={16} aria-hidden="true" />
          </button>
        )}

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute left-0 right-0 top-full z-50 mt-2 max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-xl shadow-slate-900/5 scrollbar-thin dark:border-zinc-700 dark:bg-zinc-900"
            >
              <div className="sticky top-0 border-b border-slate-100 bg-white px-3 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center gap-2">
                  <FiSearch size={14} className="shrink-0 text-slate-400" aria-hidden="true" />
                  <input
                    ref={searchRef}
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="Search by name or location..."
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={open}
                    aria-controls={listId}
                    aria-activedescendant={
                      candidates[activeIndex] ? `hub-option-${candidates[activeIndex]._id}` : undefined
                    }
                    aria-labelledby={`${listId}-label`}
                    aria-describedby={error ? errorId : undefined}
                    className="h-10 min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder-slate-400 dark:text-white dark:placeholder-zinc-500"
                  />
                </div>
              </div>

              <ul id={listId} role="listbox" aria-labelledby={`${listId}-label`} className="py-1">
                {loading ? (
                  <li aria-hidden="true">
                    <p className="px-3 pb-1 pt-1.5 text-xs text-slate-500 dark:text-zinc-400">
                      Loading hubs...
                    </p>
                    {[0, 1, 2].map((row) => (
                      <div key={row} className="flex items-start gap-3 px-3 py-2.5">
                        <Skeleton className="h-8 w-8 rounded-lg" />
                        <div className="flex-1 space-y-1.5 pt-0.5">
                          <Skeleton className="h-3 w-2/3" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </li>
                ) : fetchError ? (
                  <li role="status" className="px-4 py-5 text-center">
                    <FiAlertCircle size={26} className="mx-auto text-red-400" aria-hidden="true" />
                    <p className="mt-2 text-sm font-medium text-slate-700 dark:text-zinc-200">
                      Unable to load hubs
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">Please try again.</p>
                    <button
                      type="button"
                      onClick={retry}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-500/30 dark:bg-zinc-900 dark:text-red-400 dark:hover:bg-red-500/10"
                    >
                      <FiRefreshCw size={12} aria-hidden="true" /> Retry
                    </button>
                  </li>
                ) : candidates.length === 0 && debouncedQuery.trim() ? (
                  <li role="status" className="px-4 py-5 text-center">
                    <FiSearch size={26} className="mx-auto text-slate-300 dark:text-zinc-600" aria-hidden="true" />
                    <p className="mt-2 text-sm font-medium text-slate-700 dark:text-zinc-200">
                      No hubs found
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                      Try a different name or location.
                    </p>
                  </li>
                ) : candidates.length === 0 ? (
                  <li role="status" className="px-4 py-5 text-center">
                    <FiMapPin size={26} className="mx-auto text-slate-300 dark:text-zinc-600" aria-hidden="true" />
                    <p className="mt-2 text-sm font-medium text-slate-700 dark:text-zinc-200">
                      No hubs found yet.
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                      An Admin can create a hub from Hub Management.
                    </p>
                  </li>
                ) : (
                  candidates.map((hub, index) => (
                    <HubRow
                      key={hub._id}
                      hub={hub}
                      query={debouncedQuery}
                      isActive={index === activeIndex}
                      isSelected={hub._id === value}
                      accentText={roleTheme.primary.text}
                      onHover={() => setActiveIndex(index)}
                      onChoose={() => chooseHub(hub)}
                    />
                  ))
                )}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <p id={errorId} className="mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
          <FiAlertCircle size={12} aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
};

export default HubSelect;
