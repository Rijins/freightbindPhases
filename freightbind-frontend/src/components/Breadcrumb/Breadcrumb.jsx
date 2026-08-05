import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FiChevronRight, FiHome } from "react-icons/fi";
import { useModuleAccent } from "../../hooks/useModuleAccent";

// Static route map — every crumb points to an existing route only.
const CRUMB_ROUTES = [
  { pattern: /^\/dashboard$/, segments: [{ label: "Dashboard" }] },
  { pattern: /^\/shipments$/, segments: [{ label: "Shipments" }] },
  {
    pattern: /^\/shipments\/create$/,
    segments: [
      { label: "Shipments", to: "/shipments" },
      { label: "Create Shipment" },
    ],
  },
  {
    pattern: /^\/shipments\/edit\/.+$/,
    segments: [
      { label: "Shipments", to: "/shipments" },
      { label: "Edit Shipment" },
    ],
  },
  {
    pattern: /^\/shipments\/.+\/timeline$/,
    segments: [
      { label: "Shipments", to: "/shipments" },
      { label: "Timeline" },
    ],
  },
  {
    pattern: /^\/shipments\/.+$/,
    segments: [
      { label: "Shipments", to: "/shipments" },
      { label: "Shipment Details" },
    ],
  },
  { pattern: /^\/notifications$/, segments: [{ label: "Notifications" }] },
];

/**
 * Route-derived breadcrumbs rendered between the navbar and the content area.
 * Unknown routes fall back to a neutral label instead of rendering blank.
 */
const Breadcrumb = () => {
  const location = useLocation();
  const accent = useModuleAccent();

  const segments = useMemo(() => {
    const match = CRUMB_ROUTES.find((route) => route.pattern.test(location.pathname));
    return match?.segments || [{ label: "Page" }];
  }, [location.pathname]);

  return (
    <nav
      aria-label="Breadcrumb"
      className="shrink-0 border-b border-slate-200 bg-white/60 px-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/60 md:px-8"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.ol
          key={location.pathname}
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -3 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
          className="flex h-10 items-center gap-1.5 overflow-hidden text-xs"
        >
          <li className="flex shrink-0 items-center">
            <Link
              to="/dashboard"
              className="flex items-center gap-1 rounded p-1 text-slate-400 transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 dark:text-zinc-500 dark:hover:text-white dark:focus-visible:ring-zinc-700"
              aria-label="Dashboard home"
            >
              <FiHome size={14} />
            </Link>
          </li>
          {segments.map((segment, index) => {
            const isLast = index === segments.length - 1;
            return (
              <li key={`${segment.label}-${index}`} className="flex min-w-0 items-center gap-1.5">
                <FiChevronRight size={14} className="shrink-0 text-slate-400 dark:text-zinc-600" />
                {segment.to && !isLast ? (
                  <Link
                    to={segment.to}
                    className="truncate text-slate-500 transition-colors hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white"
                  >
                    {segment.label}
                  </Link>
                ) : (
                  <span className={`truncate font-medium ${accent.text}`} aria-current="page">
                    {segment.label}
                  </span>
                )}
              </li>
            );
          })}
        </motion.ol>
      </AnimatePresence>
    </nav>
  );
};

export default Breadcrumb;
