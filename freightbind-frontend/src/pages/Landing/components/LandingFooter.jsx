import { Link } from "react-router-dom";
import { FiTruck } from "react-icons/fi";

const LINK_GROUPS = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How It Works", href: "#workflow" },
      { label: "AI Intelligence", href: "#ai" },
    ],
  },
  {
    heading: "Platform",
    links: [
      { label: "Shipment Management", href: "#features" },
      { label: "Real-Time Tracking", href: "#features" },
      { label: "Role-Based Operations", href: "#roles" },
    ],
  },
  {
    heading: "AI Intelligence",
    links: [
      { label: "Delay Risk Prediction", href: "#ai" },
      { label: "Shipment Summaries", href: "#ai" },
      { label: "Recommendations", href: "#ai" },
    ],
  },
  {
    heading: "Contact",
    links: [
      { label: "Contact Sales", href: "#contact" },
      { label: "Login", href: "/login" },
    ],
  },
];

/**
 * LandingFooter — professional footer with brand block, section link groups,
 * and a Login entry. No invented addresses, phones, emails or social links.
 */
const LandingFooter = () => (
  <footer
    id="contact"
    aria-labelledby="footer-heading"
    className="scroll-mt-20 border-t border-slate-200/80 bg-slate-100/70 dark:border-zinc-800 dark:bg-zinc-900/40"
  >
    <h2 id="footer-heading" className="sr-only">
      Footer
    </h2>
    <div className="mx-auto w-full max-w-7xl px-4 py-14 md:px-8">
      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-6">
        <div className="lg:col-span-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-harbor-500"
            aria-label="FreightBind AI home"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-harbor-50 dark:bg-harbor-500/10">
              <FiTruck size={18} className="text-harbor-600 dark:text-harbor-400" aria-hidden="true" />
            </span>
            <span className="whitespace-nowrap font-display text-base font-semibold tracking-tight text-navy-900 dark:text-white">
              FreightBind <span className="text-harbor-600 dark:text-harbor-400">AI</span>
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-600 dark:text-zinc-400">
            The intelligent logistics coordination platform connecting shipments, carriers, hubs
            and operational teams in one system.
          </p>
        </div>

        {LINK_GROUPS.map((group) => (
          <nav key={group.heading} aria-label={group.heading}>
            <h3 className="text-sm font-semibold text-navy-900 dark:text-white">{group.heading}</h3>
            <ul className="mt-4 space-y-2.5">
              {group.links.map((link) => (
                <li key={link.label}>
                  {link.href.startsWith("/") ? (
                    <Link
                      to={link.href}
                      className="text-sm text-slate-600 transition-colors hover:text-harbor-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-harbor-500 rounded dark:text-zinc-400 dark:hover:text-harbor-400"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className="rounded text-sm text-slate-600 transition-colors hover:text-harbor-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-harbor-500 dark:text-zinc-400 dark:hover:text-harbor-400"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-slate-200/80 pt-6 sm:flex-row dark:border-zinc-800">
        <p className="text-xs text-slate-500 dark:text-zinc-500">
          © {new Date().getFullYear()} FreightBind AI. All rights reserved.
        </p>
        <Link
          to="/login"
          className="rounded text-xs font-medium text-slate-500 transition-colors hover:text-harbor-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-harbor-500 dark:text-zinc-500 dark:hover:text-harbor-400"
        >
          Login
        </Link>
      </div>
    </div>
  </footer>
);

export default LandingFooter;
