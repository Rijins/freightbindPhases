import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiAnchor,
  FiArchive,
  FiCheckCircle,
  FiChevronRight,
  FiLayers,
  FiPackage,
  FiTruck,
} from "react-icons/fi";
import Badge from "../../../components/Badges/Badge";
import GlassCard from "../../../components/Card/GlassCard";
import { EASE, fadeInUp, staggerContainer } from "../../../animations";

const JOURNEY_STEPS = [
  { label: "Shipment", icon: FiPackage },
  { label: "Port", icon: FiAnchor },
  { label: "Rail", icon: FiLayers },
  { label: "Hub", icon: FiArchive },
  { label: "Truck", icon: FiTruck },
  { label: "Delivery", icon: FiCheckCircle },
];

const PRIMARY_CTA =
  "inline-flex items-center justify-center gap-2 rounded-[14px] bg-harbor-600 px-6 py-3 text-base font-medium text-white " +
  "shadow-sm transition-all duration-150 hover:bg-harbor-500 hover:shadow " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-harbor-500 " +
  "focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-950 active:scale-[0.98]";

const SECONDARY_CTA =
  "inline-flex items-center justify-center gap-2 rounded-[14px] border border-slate-300 bg-transparent px-6 py-3 " +
  "text-base font-medium text-slate-700 transition-all duration-150 hover:bg-slate-50 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 " +
  "dark:border-zinc-700 dark:text-slate-200 dark:hover:bg-zinc-800/60 active:scale-[0.98]";

/**
 * Hero — headline, CTAs and an illustrative Shipment → Port → Rail → Hub →
 * Truck → Delivery journey rail. Purely presentational; the steps are a
 * product illustration, not live system data.
 */
const Hero = () => (
  <section
    id="top"
    aria-labelledby="hero-heading"
    className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100/70 dark:from-zinc-950 dark:to-zinc-900/30"
  >
    <div
      className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[42rem] max-w-full -translate-x-1/2 rounded-full bg-harbor-400/20 blur-3xl dark:bg-harbor-500/10"
      aria-hidden="true"
    />
    <div
      className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(15,23,42,0.04)_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[radial-gradient(rgba(148,163,184,0.05)_1px,transparent_1px)]"
      aria-hidden="true"
    />

    <div className="relative mx-auto w-full max-w-7xl px-4 pb-16 pt-20 md:px-8 md:pb-24 md:pt-28">
      <motion.div
        variants={staggerContainer(0.08, 0.05)}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-3xl text-center"
      >
        <motion.div variants={fadeInUp}>
          <Badge tone="custom" size="md" className="border border-harbor-200/70 bg-harbor-50 text-harbor-700 dark:border-harbor-500/20 dark:bg-harbor-500/10 dark:text-harbor-300">
            Intelligent logistics coordination platform
          </Badge>
        </motion.div>

        <motion.h1
          id="hero-heading"
          variants={fadeInUp}
          className="mt-6 font-display text-4xl font-semibold leading-[1.1] tracking-tight text-navy-900 sm:text-5xl lg:text-6xl dark:text-white"
        >
          Every shipment, carrier, hub and team —{" "}
          <span className="bg-gradient-to-r from-harbor-600 to-harbor-500 bg-clip-text text-transparent dark:from-harbor-400 dark:to-harbor-300">
            coordinated in one system
          </span>
        </motion.h1>

        <motion.p
          variants={fadeInUp}
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-zinc-400"
        >
          FreightBind AI connects shipments, carriers, hubs and operational teams in a single
          intelligent platform — with real-time tracking, live updates and AI-driven risk
          intelligence across the entire logistics lifecycle.
        </motion.p>

        <motion.div variants={fadeInUp} className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/login" className={PRIMARY_CTA}>
            Get Started
          </Link>
          <a href="#preview" className={SECONDARY_CTA}>
            Explore Platform
            <FiChevronRight size={18} aria-hidden="true" />
          </a>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE, delay: 0.35 }}
        className="mx-auto mt-16 max-w-5xl md:mt-20"
      >
        <GlassCard padded={false} className="p-5 md:p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-400">
              A shipment&apos;s journey across the network
            </h2>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-400">
              Illustrative
            </span>
          </div>

          <ol className="flex flex-col gap-2 md:flex-row md:items-center md:gap-0">
            {JOURNEY_STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <li key={step.label} className="flex items-center gap-2 md:flex-1 md:flex-col md:gap-3">
                  <div className="flex items-center gap-2 md:flex-col md:gap-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-harbor-600 shadow-panel dark:border-zinc-700 dark:bg-zinc-900 dark:text-harbor-400">
                      <Icon size={20} aria-hidden="true" />
                    </span>
                    <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">
                      {step.label}
                    </span>
                  </div>
                  {index < JOURNEY_STEPS.length - 1 && (
                    <FiChevronRight
                      size={16}
                      className="hidden shrink-0 text-slate-300 dark:text-zinc-600 md:block"
                      aria-hidden="true"
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </GlassCard>
      </motion.div>
    </div>
  </section>
);

export default Hero;
