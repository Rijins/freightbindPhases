import { Link } from "react-router-dom";
import { motion, MotionConfig } from "framer-motion";
import { FiTruck } from "react-icons/fi";
import AuthBackground from "./AuthBackground";
import AuthVisual from "./AuthVisual";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import { EASE } from "../../animations";

/**
 * Shared premium shell for the Login / Register pages.
 *
 * Left (lg+): FreightBind brand panel — logo, headline, statement, feature
 * bullets and the animated freight-terminal visual.
 * Right: atmospheric background, theme toggle, mobile brand header and the
 * auth card (heading + children) with entrance animation.
 *
 * Purely presentational — no auth logic lives here. Motion honors the global
 * MotionConfig reduced-motion rule (same as the Landing page).
 */
const AuthLayout = ({
  panelHeadline,
  panelStatement,
  bullets = [],
  cardHeading,
  cardSubheading,
  children,
}) => (
  <MotionConfig reducedMotion="user">
    <div className="relative flex min-h-screen w-full overflow-hidden bg-navy-950">
      <motion.aside
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="relative hidden w-1/2 shrink-0 flex-col justify-between overflow-hidden border-r border-white/5 bg-navy-900 lg:flex"
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(46,147,133,0.14),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(rgba(148,163,184,0.06)_1px,transparent_1px)] bg-[size:26px_26px]" />
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[58%]">
          <AuthVisual className="h-full w-full" />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-transparent via-transparent to-navy-900" />

        <div className="relative z-10 flex h-full flex-col justify-between px-14 pb-12 pt-12 text-white">
          <Link
            to="/"
            className="flex w-fit items-center gap-2 rounded-lg font-display text-xl font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-harbor-500"
            aria-label="FreightBind AI home"
          >
            <FiTruck size={22} className="text-harbor-400" aria-hidden="true" />
            FreightBind AI
          </Link>

          <div className="drop-shadow-[0_4px_16px_rgba(7,11,20,0.8)]">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-harbor-400">
              Intelligent logistics coordination
            </p>
            <h1 className="max-w-md font-display text-4xl font-semibold leading-tight text-white">
              {panelHeadline}
            </h1>
            <p className="mt-4 max-w-sm text-slate-400">{panelStatement}</p>
            {bullets.length > 0 && (
              <ul className="mt-8 space-y-3">
                {bullets.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-3 text-sm text-slate-300">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                      <Icon size={15} className="text-harbor-300" aria-hidden="true" />
                    </span>
                    {text}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="text-xs text-slate-500">© {new Date().getFullYear()} FreightBind AI</p>
        </div>
      </motion.aside>

      <main className="relative flex min-h-screen flex-1 items-center justify-center px-5 py-12 sm:px-10">
        <AuthBackground />

        <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
          <ThemeToggle />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE, delay: 0.1 }}
          className="relative z-10 w-full max-w-md"
        >
          <Link
            to="/"
            className="mb-8 flex items-center gap-2 rounded-lg font-display text-lg font-semibold text-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-harbor-500 dark:text-white lg:hidden"
            aria-label="FreightBind AI home"
          >
            <FiTruck size={20} className="text-harbor-500 dark:text-harbor-400" aria-hidden="true" />
            FreightBind AI
          </Link>

          <div className="rounded-[24px] border border-slate-200/80 bg-white/85 p-6 shadow-xl shadow-slate-900/[0.06] backdrop-blur-xl transition-shadow duration-200 hover:shadow-panelHover sm:p-8 dark:border-zinc-800 dark:bg-zinc-900/85 dark:shadow-black/30">
            <div className="mb-6 flex items-center gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-harbor-400 to-harbor-600 text-white shadow-md shadow-harbor-600/25">
                <FiTruck size={20} aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-xl font-semibold tracking-tight">{cardHeading}</h2>
                <p className="mt-0.5 text-sm text-slate-500 dark:text-zinc-400">{cardSubheading}</p>
              </div>
            </div>
            {children}
          </div>
        </motion.div>
      </main>
    </div>
  </MotionConfig>
);

export default AuthLayout;
