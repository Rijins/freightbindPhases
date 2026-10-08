import { ROLES } from "./constants";

// ============================================================
// THEME SYSTEM TOKENS
// ============================================================

export const THEME_STORAGE_KEY = "freightbind_theme";

export const getStoredTheme = () => {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
};

export const getSystemTheme = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

export const resolveInitialTheme = () => getStoredTheme() || getSystemTheme();

// ============================================================
// ROLE THEMES — every role has its own identity (rule 05 / 06).
// All values are complete literal Tailwind class strings so the
// JIT compiler can see them. Never interpolate color names.
// ============================================================

export const ROLE_THEMES = Object.freeze({
  [ROLES.ADMIN]: {
    label: "Admin",
    primary: {
      solidBg: "bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm",
      softBg:
        "bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20",
      softText: "text-indigo-700 dark:text-indigo-400",
      text: "text-indigo-600 dark:text-indigo-400",
      icon: "text-indigo-600 dark:text-indigo-400",
      dot: "bg-indigo-600",
      ring: "ring-indigo-500",
      focusRing: "focus-visible:ring-indigo-500",
      inputRing: "focus:border-indigo-500 focus:ring-indigo-500/30",
      activePill: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300",
      chart: "#6366F1",
      gradient: "bg-gradient-to-r from-indigo-600 to-indigo-500",
    },
    secondary: {
      solidBg: "bg-purple-600 text-white hover:bg-purple-500 shadow-sm",
      softBg:
        "bg-purple-50 hover:bg-purple-100 dark:bg-purple-500/10 dark:hover:bg-purple-500/20",
      softText: "text-purple-700 dark:text-purple-400",
      text: "text-purple-600 dark:text-purple-400",
      icon: "text-purple-600 dark:text-purple-400",
      dot: "bg-purple-600",
      ring: "ring-purple-500",
      chart: "#A855F7",
    },
  },
  [ROLES.LOGISTICS_DIRECTOR]: {
    label: "Logistics Director",
    primary: {
      solidBg: "bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm",
      softBg:
        "bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20",
      softText: "text-emerald-700 dark:text-emerald-400",
      text: "text-emerald-600 dark:text-emerald-400",
      icon: "text-emerald-600 dark:text-emerald-400",
      dot: "bg-emerald-600",
      ring: "ring-emerald-500",
      focusRing: "focus-visible:ring-emerald-500",
      inputRing: "focus:border-emerald-500 focus:ring-emerald-500/30",
      activePill:
        "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
      chart: "#10B981",
      gradient: "bg-gradient-to-r from-emerald-600 to-emerald-500",
    },
    secondary: {
      solidBg: "bg-teal-600 text-white hover:bg-teal-500 shadow-sm",
      softBg:
        "bg-teal-50 hover:bg-teal-100 dark:bg-teal-500/10 dark:hover:bg-teal-500/20",
      softText: "text-teal-700 dark:text-teal-400",
      text: "text-teal-600 dark:text-teal-400",
      icon: "text-teal-600 dark:text-teal-400",
      dot: "bg-teal-600",
      ring: "ring-teal-500",
      chart: "#14B8A6",
    },
  },
  [ROLES.CARRIER_DISPATCHER]: {
    label: "Carrier Dispatcher",
    primary: {
      solidBg: "bg-orange-600 text-white hover:bg-orange-500 shadow-sm",
      softBg:
        "bg-orange-50 hover:bg-orange-100 dark:bg-orange-500/10 dark:hover:bg-orange-500/20",
      softText: "text-orange-700 dark:text-orange-400",
      text: "text-orange-600 dark:text-orange-400",
      icon: "text-orange-600 dark:text-orange-400",
      dot: "bg-orange-600",
      ring: "ring-orange-500",
      focusRing: "focus-visible:ring-orange-500",
      inputRing: "focus:border-orange-500 focus:ring-orange-500/30",
      activePill:
        "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300",
      chart: "#F97316",
      gradient: "bg-gradient-to-r from-orange-600 to-orange-500",
    },
    secondary: {
      solidBg: "bg-amber-500 text-white hover:bg-amber-400 shadow-sm",
      softBg:
        "bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/10 dark:hover:bg-amber-500/20",
      softText: "text-amber-700 dark:text-amber-400",
      text: "text-amber-600 dark:text-amber-400",
      icon: "text-amber-600 dark:text-amber-400",
      dot: "bg-amber-500",
      ring: "ring-amber-500",
      chart: "#F59E0B",
    },
  },
  [ROLES.HUB_OPERATOR]: {
    label: "Hub Operator",
    primary: {
      solidBg: "bg-cyan-600 text-white hover:bg-cyan-500 shadow-sm",
      softBg:
        "bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-500/10 dark:hover:bg-cyan-500/20",
      softText: "text-cyan-700 dark:text-cyan-400",
      text: "text-cyan-600 dark:text-cyan-400",
      icon: "text-cyan-600 dark:text-cyan-400",
      dot: "bg-cyan-600",
      ring: "ring-cyan-500",
      focusRing: "focus-visible:ring-cyan-500",
      inputRing: "focus:border-cyan-500 focus:ring-cyan-500/30",
      activePill: "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300",
      chart: "#06B6D4",
      gradient: "bg-gradient-to-r from-cyan-600 to-cyan-500",
    },
    secondary: {
      solidBg: "bg-blue-600 text-white hover:bg-blue-500 shadow-sm",
      softBg:
        "bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20",
      softText: "text-blue-700 dark:text-blue-400",
      text: "text-blue-600 dark:text-blue-400",
      icon: "text-blue-600 dark:text-blue-400",
      dot: "bg-blue-600",
      ring: "ring-blue-500",
      chart: "#3B82F6",
    },
  },
});

// ============================================================
// MODULE ACCENTS — accent-only colors per module (never
// recolor whole screens). Last five modules are future-ready
// (charts, AI, fleet, settings) — no pages exist yet.
// ============================================================

export const MODULE_ACCENTS = Object.freeze({
  dashboard: { label: "Dashboard", text: "text-indigo-600 dark:text-indigo-400", dot: "bg-indigo-500", chart: "#6366F1" },
  shipments: { label: "Shipments", text: "text-blue-600 dark:text-blue-400", dot: "bg-blue-500", chart: "#3B82F6" },
  notifications: { label: "Notifications", text: "text-amber-600 dark:text-amber-400", dot: "bg-amber-500", chart: "#F59E0B" },
  timeline: { label: "Timeline", text: "text-cyan-600 dark:text-cyan-400", dot: "bg-cyan-500", chart: "#06B6D4" },
  analytics: { label: "Analytics", text: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500", chart: "#10B981" },
  reports: { label: "Reports", text: "text-rose-600 dark:text-rose-400", dot: "bg-rose-500", chart: "#F43F5E" },
  ai: { label: "AI Insights", text: "text-purple-600 dark:text-purple-400", dot: "bg-purple-500", chart: "#A855F7" },
  fleet: { label: "Fleet", text: "text-orange-600 dark:text-orange-400", dot: "bg-orange-500", chart: "#F97316" },
  settings: { label: "Settings", text: "text-slate-600 dark:text-slate-400", dot: "bg-slate-500", chart: "#64748B" },
});

// Order matters — timeline must be matched before the generic shipments rule.
export const MODULE_ROUTES = Object.freeze([
  { pattern: /^\/dashboard/, module: "dashboard" },
  { pattern: /^\/shipments\/.+\/timeline$/, module: "timeline" },
  { pattern: /^\/shipments/, module: "shipments" },
  { pattern: /^\/notifications/, module: "notifications" },
  { pattern: /^\/announcements/, module: "notifications" },
  { pattern: /^\/profile/, module: "settings" },
  { pattern: /^\/analytics/, module: "analytics" },
  { pattern: /^\/reports/, module: "reports" },
  { pattern: /^\/ai/, module: "ai" },
  { pattern: /^\/fleet/, module: "fleet" },
  { pattern: /^\/settings/, module: "settings" },
]);

/** Resolves the accent token for any route path. Shared by the module-accent
 *  hook and the global search so the mapping is defined exactly once. */
export const resolveModuleAccent = (pathname) => {
  const match = MODULE_ROUTES.find((route) => route.pattern.test(pathname));
  return MODULE_ACCENTS[match?.module || "dashboard"];
};
