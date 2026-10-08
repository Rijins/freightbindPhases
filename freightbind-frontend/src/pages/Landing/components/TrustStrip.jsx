import { motion } from "framer-motion";
import {
  FiBarChart2,
  FiBell,
  FiCpu,
  FiLayers,
  FiMapPin,
  FiShield,
} from "react-icons/fi";
import { staggerContainer, fadeInUp } from "../../../animations";

const CAPABILITIES = [
  { label: "Real-Time Tracking", icon: FiMapPin },
  { label: "Role-Based Operations", icon: FiShield },
  { label: "AI Risk Intelligence", icon: FiCpu },
  { label: "Live Notifications", icon: FiBell },
  { label: "Shipment Lifecycle Management", icon: FiLayers },
  { label: "Operational Analytics", icon: FiBarChart2 },
];

/**
 * TrustStrip — compact capability strip under the hero. Lightweight by
 * design: one row of icon + label chips that wraps on small screens.
 */
const TrustStrip = () => (
  <section
    aria-label="Platform capabilities"
    className="border-y border-slate-200/80 bg-slate-100/60 dark:border-zinc-800 dark:bg-zinc-900/40"
  >
    <motion.ul
      variants={staggerContainer(0.05)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.4 }}
      className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-4 py-6 md:justify-between md:px-8"
    >
      {CAPABILITIES.map((item) => {
        const Icon = item.icon;
        return (
          <motion.li
            key={item.label}
            variants={fadeInUp}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-zinc-300"
          >
            <Icon size={16} className="shrink-0 text-harbor-600 dark:text-harbor-400" aria-hidden="true" />
            {item.label}
          </motion.li>
        );
      })}
    </motion.ul>
  </section>
);

export default TrustStrip;
