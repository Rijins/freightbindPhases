import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiAlertCircle, FiCheck, FiChevronDown, FiRefreshCw, FiSearch, FiUsers, FiX } from "react-icons/fi";
import Avatar from "../Avatar/Avatar";
import Badge from "../Badges/Badge";
import Skeleton from "../Skeleton/Skeleton";
import UserRoleBadge from "../../pages/users/components/UserRoleBadge";
import userService from "../../services/userService";
import useDebounce from "../../hooks/useDebounce";
import { useRoleTheme } from "../../contexts/RoleThemeContext";
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

const OperatorRow = ({ operator, query, isActive, isSelected, accentText, onHover, onChoose }) => (
  <li
    role="option"
    id={`operator-option-${operator._id}`}
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
      <Avatar name={operator.fullName} src={operator.profileImage} size="sm" className="mt-0.5" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-slate-900 dark:text-white">
          <HighlightName name={operator.fullName} query={query} accentText={accentText} />
        </span>
        <span className="block truncate text-xs text-slate-500 dark:text-zinc-400">{operator.email}</span>
        <span className="mt-1 flex flex-wrap items-center gap-1.5">
          <UserRoleBadge role={operator.role} />
          <Badge tone="emerald" dot>
            Active
          </Badge>
        </span>
      </span>
      {isSelected && <FiCheck size={16} className="mt-2 shrink-0 text-emerald-500" aria-hidden="true" />}
    </button>
  </li>
);

/**
 * HubOperatorSelect — searchable combobox for picking an active Hub Operator
 * during hub assignment. Candidates come from GET /users/hub-operators
 * (server enforces role + status). The raw Mongo ID is kept inside the form
 * value but is never rendered to the user.
 */
const HubOperatorSelect = ({
  label = "Hub Operator",
  value = "",
  displayUser = null,
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

  const selectedUser =
    (value && candidates.find((candidate) => candidate._id === value)) ||
    (value && displayUser) ||
    null;

  const toggleDropdown = () => {
    if (disabled) return;
    setOpen((isOpen) => !isOpen);
  };

  const closeDropdown = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const chooseOperator = (operator) => {
    onChange?.(operator);
    setQuery("");
    setOpen(false);
    triggerRef.current?.focus();
  };

  const clearOperator = () => {
    onChange?.(null);
    setQuery("");
  };

  const retry = () => {
    requestSeq.current += 1;
    setFetchError(null);
    setLoading(true);
    userService
      .listHubOperatorCandidates({ search: debouncedQuery, page: 1, limit: PAGE_LIMIT })
      .then(({ users }) => {
        setCandidates(users);
        setLoading(false);
      })
      .catch(() => {
        setFetchError("Unable to load hub operators");
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const seq = ++requestSeq.current;
    setLoading(true);
    setFetchError(null);

    userService
      .listHubOperatorCandidates({ search: debouncedQuery, page: 1, limit: PAGE_LIMIT })
      .then(({ users }) => {
        if (cancelled || requestSeq.current !== seq) return;
        setCandidates(users);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled || requestSeq.current !== seq) return;
        setFetchError("Unable to load hub operators");
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
      if (candidates[activeIndex]) chooseOperator(candidates[activeIndex]);
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
        {selectedUser ? (
          <button
            ref={triggerRef}
            type="button"
            disabled={disabled}
            onClick={toggleDropdown}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={open ? listId : undefined}
            aria-describedby={error ? errorId : undefined}
            aria-label={`${label}: ${selectedUser.fullName}`}
            className={buildTriggerClasses(roleTheme, { error, selected: true, disabled })}
          >
            <span className="flex min-w-0 items-start gap-3 text-left">
              <Avatar name={selectedUser.fullName} src={selectedUser.profileImage} size="sm" className="mt-0.5" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-slate-900 dark:text-white">
                  {selectedUser.fullName}
                </span>
                <span className="block truncate text-xs text-slate-500 dark:text-zinc-400">
                  {selectedUser.email}
                </span>
                <span className="mt-1 flex flex-wrap items-center gap-1.5">
                  <UserRoleBadge role={selectedUser.role} />
                  <Badge tone="emerald" dot>
                    Active
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
              <span className="truncate text-slate-400 dark:text-zinc-500">Search hub operator...</span>
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

        {selectedUser && !disabled && (
          <button
            type="button"
            onClick={clearOperator}
            aria-label="Remove hub operator"
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
                    placeholder="Search by name or email..."
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={open}
                    aria-controls={listId}
                    aria-activedescendant={
                      candidates[activeIndex] ? `operator-option-${candidates[activeIndex]._id}` : undefined
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
                      Loading hub operators...
                    </p>
                    {[0, 1, 2].map((row) => (
                      <div key={row} className="flex items-start gap-3 px-3 py-2.5">
                        <Skeleton className="h-8 w-8 rounded-full" />
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
                      Unable to load hub operators
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
                      No hub operators found
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                      Try a different name or email.
                    </p>
                  </li>
                ) : candidates.length === 0 ? (
                  <li role="status" className="px-4 py-5 text-center">
                    <FiUsers size={26} className="mx-auto text-slate-300 dark:text-zinc-600" aria-hidden="true" />
                    <p className="mt-2 text-sm font-medium text-slate-700 dark:text-zinc-200">
                      No active Hub Operators found.
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                      Create a Hub Operator from User Management first.
                    </p>
                  </li>
                ) : (
                  candidates.map((operator, index) => (
                    <OperatorRow
                      key={operator._id}
                      operator={operator}
                      query={debouncedQuery}
                      isActive={index === activeIndex}
                      isSelected={operator._id === value}
                      accentText={roleTheme.primary.text}
                      onHover={() => setActiveIndex(index)}
                      onChoose={() => chooseOperator(operator)}
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

export default HubOperatorSelect;
