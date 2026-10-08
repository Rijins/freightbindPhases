import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiMenu, FiTruck, FiX } from "react-icons/fi";
import ThemeToggle from "../../../components/ThemeToggle/ThemeToggle";

const NAV_LINKS = [
  { label: "Product", href: "#product" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#workflow" },
  { label: "AI Intelligence", href: "#ai" },
  { label: "Contact", href: "#contact" },
];

// Matches the shared Button component's base shape (rounded-[14px], focus
// ring, active press) so CTA links look identical to real buttons without
// nesting interactive elements.
const GHOST_LINK_CLASSES =
  "inline-flex items-center justify-center rounded-[14px] px-4 py-2 text-sm font-medium " +
  "text-slate-600 transition-all duration-150 hover:bg-slate-100 hover:text-slate-900 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-harbor-500 " +
  "active:scale-[0.98] dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white";

const PRIMARY_LINK_CLASSES =
  "inline-flex items-center justify-center rounded-[14px] bg-harbor-600 px-4 py-2 text-sm font-medium text-white " +
  "shadow-sm transition-all duration-150 hover:bg-harbor-500 hover:shadow " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-harbor-500 " +
  "focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-950 " +
  "active:scale-[0.98]";

/**
 * Public landing navbar. Glass surface matching the internal navbar, brand
 * identity from the login screen (harbor accent + FiTruck), hash links for
 * section scrolling, and a keyboard-accessible mobile menu (Escape / outside
 * click close). Theme toggle is the shared component, so dark/light works.
 */
const LandingNavbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    if (!mobileOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    const handlePointerDown = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setMobileOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("pointerdown", handlePointerDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-slate-50/80 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/70">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 md:px-8"
      >
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-harbor-500"
          aria-label="FreightBind AI home"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-harbor-50 dark:bg-harbor-500/10">
            <FiTruck size={18} className="text-harbor-600 dark:text-harbor-400" aria-hidden="true" />
          </span>
          <span className="whitespace-nowrap font-display text-base font-semibold tracking-tight text-navy-900 dark:text-white">
            FreightBind <span className="text-harbor-600 dark:text-harbor-400">AI</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex" role="list">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              role="listitem"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-harbor-500 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <div className="hidden items-center gap-1.5 sm:flex">
            <Link to="/login" className={GHOST_LINK_CLASSES}>
              Login
            </Link>
            <Link to="/register" className={PRIMARY_LINK_CLASSES}>
              Get Started
            </Link>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-controls="landing-mobile-menu"
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-harbor-500 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white lg:hidden"
          >
            {mobileOpen ? <FiX size={20} aria-hidden="true" /> : <FiMenu size={20} aria-hidden="true" />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div
          id="landing-mobile-menu"
          ref={mobileMenuRef}
          className="border-t border-slate-200/80 bg-slate-50/95 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/95 lg:hidden"
        >
          <div className="mx-auto w-full max-w-7xl space-y-1 px-4 py-3 md:px-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-harbor-500 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-white"
              >
                {link.label}
              </a>
            ))}
            <div className="flex items-center gap-2 pt-2">
              <Link to="/login" className={`${GHOST_LINK_CLASSES} flex-1`}>
                Login
              </Link>
              <Link to="/register" className={`${PRIMARY_LINK_CLASSES} flex-1`}>
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default LandingNavbar;
