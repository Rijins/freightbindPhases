import { motion } from "framer-motion";
import {
  FiAlertTriangle,
  FiBell,
  FiCpu,
  FiMapPin,
  FiShield,
  FiTruck,
} from "react-icons/fi";
import Badge from "../../../components/Badges/Badge";
import { fadeInUp, staggerContainer } from "../../../animations";

const FEATURES = [
  {
    icon: FiTruck,
    title: "Shipment Management",
    description: "Manage the shipment lifecycle from creation to delivery — every detail in one place.",
  },
  {
    icon: FiMapPin,
    title: "Real-Time Tracking",
    description: "Monitor shipment status and timeline changes as they happen, without manual refreshes.",
  },
  {
    icon: FiShield,
    title: "Role-Based Operations",
    description: "Different teams receive the tools and information relevant to their role.",
  },
  {
    icon: FiBell,
    title: "Live Notifications",
    description: "Receive operational updates instantly instead of refreshing the application repeatedly.",
  },
  {
    icon: FiAlertTriangle,
    title: "AI Delay Risk",
    description: "Identify shipments that may be at risk of delay before problems compound.",
  },
  {
    icon: FiCpu,
    title: "AI Shipment Intelligence",
    description: "Generate concise shipment summaries and actionable insights from live operational data.",
  },
];

/**
 * CoreFeatures — premium feature grid. Reuses the shared Card surface and
 * framer stagger so the section matches the rest of the product.
 */
const CoreFeatures = () => (
  <section
    id="features"
    aria-labelledby="features-heading"
    className="scroll-mt-20 bg-gradient-to-b from-white to-slate-50 py-20 dark:bg-zinc-950 md:py-28"
  >
    <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="mx-auto max-w-2xl text-center"
      >
        <Badge tone="custom" className="bg-harbor-50 text-harbor-700 dark:bg-harbor-500/10 dark:text-harbor-300">
          Core Features
        </Badge>
        <h2
          id="features-heading"
          className="mt-4 font-display text-3xl font-semibold tracking-tight text-navy-900 sm:text-4xl dark:text-white"
        >
          Everything operations needs, in one platform
        </h2>
        <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-zinc-400">
          From lifecycle management to AI-assisted decision making, FreightBind AI keeps every
          team working from the same real-time picture.
        </p>
      </motion.div>

      <motion.ul
        variants={staggerContainer(0.06)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <motion.li
              key={feature.title}
              variants={fadeInUp}
              className="group relative overflow-hidden rounded-[20px] border border-slate-200/80 bg-white p-6 shadow-panel transition-all duration-150 hover:-translate-y-0.5 hover:border-slate-300/80 hover:shadow-panelHover dark:border-zinc-800 dark:bg-zinc-900"
            >
              <span
                className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-harbor-600 to-harbor-400 opacity-0 transition-opacity duration-150 group-hover:opacity-100 dark:from-harbor-400 dark:to-harbor-300"
                aria-hidden="true"
              />
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-harbor-50 text-harbor-600 dark:bg-harbor-500/10 dark:text-harbor-400">
                <Icon size={20} aria-hidden="true" />
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold text-navy-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-zinc-400">
                {feature.description}
              </p>
            </motion.li>
          );
        })}
      </motion.ul>
    </div>
  </section>
);

export default CoreFeatures;
