import { motion } from "framer-motion";
import {
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiLayers,
  FiMail,
  FiPhoneCall,
  FiXCircle,
} from "react-icons/fi";
import Badge from "../../../components/Badges/Badge";
import { fadeInUp, staggerContainer } from "../../../animations";

const FRAGMENTATION_POINTS = [
  { label: "Spreadsheets that go stale", icon: FiFileText },
  { label: "Email threads with no owner", icon: FiMail },
  { label: "Phone calls with no record", icon: FiPhoneCall },
  { label: "Disconnected tracking systems", icon: FiXCircle },
  { label: "Delayed updates reaching teams late", icon: FiClock },
];

const CENTRALIZED_POINTS = [
  "One shared view of every shipment",
  "Every status change recorded in a live timeline",
  "Notifications pushed to the right team instantly",
  "Role-based tools for each operational team",
  "AI assistance on top of the same data",
];

/**
 * ProblemSolution — two-column narrative: the fragmented status quo vs the
 * centralized FreightBind workflow.
 */
const ProblemSolution = () => (
  <section
    id="product"
    aria-labelledby="problem-solution-heading"
    className="scroll-mt-20 bg-slate-50 py-20 dark:bg-zinc-950 md:py-28"
  >
    <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="mx-auto max-w-2xl text-center"
      >
        <Badge tone="custom" className="bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
          Why FreightBind AI
        </Badge>
        <h2
          id="problem-solution-heading"
          className="mt-4 font-display text-3xl font-semibold tracking-tight text-navy-900 sm:text-4xl dark:text-white"
        >
          From fragmented chaos to one coordinated operation
        </h2>
      </motion.div>

      <div className="mt-14 grid gap-8 lg:grid-cols-2">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="rounded-[20px] border border-slate-200/80 bg-white p-8 shadow-panel dark:border-zinc-800 dark:bg-zinc-900"
        >
          <h3 className="flex items-center gap-2 font-display text-xl font-semibold text-navy-900 dark:text-white">
            <FiXCircle size={20} className="text-signal-rust" aria-hidden="true" />
            Traditional logistics, fragmented
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-zinc-400">
            Without a shared system, freight operations scatter across tools — and the cost shows
            up as missed updates, double entries and delayed decisions.
          </p>
          <ul className="mt-6 space-y-3">
            {FRAGMENTATION_POINTS.map((point) => {
              const Icon = point.icon;
              return (
                <li key={point.label} className="flex items-center gap-3 text-sm text-slate-700 dark:text-zinc-300">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-signal-rust dark:bg-red-500/10 dark:text-red-400">
                    <Icon size={16} aria-hidden="true" />
                  </span>
                  {point.label}
                </li>
              );
            })}
          </ul>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="relative overflow-hidden rounded-[20px] border border-harbor-200/70 bg-gradient-to-br from-harbor-50 to-white p-8 shadow-panel dark:border-harbor-500/20 dark:from-harbor-500/10 dark:to-zinc-900"
        >
          <h3 className="flex items-center gap-2 font-display text-xl font-semibold text-navy-900 dark:text-white">
            <FiLayers size={20} className="text-harbor-600 dark:text-harbor-400" aria-hidden="true" />
            FreightBind, centralized
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-zinc-400">
            FreightBind AI replaces the sprawl with a single operational layer — one place where
            shipments, carriers, hubs and teams stay aligned in real time.
          </p>
          <ul className="mt-6 space-y-3">
            {CENTRALIZED_POINTS.map((point) => (
              <li key={point} className="flex items-center gap-3 text-sm text-slate-700 dark:text-zinc-300">
                <FiCheckCircle size={18} className="shrink-0 text-harbor-600 dark:text-harbor-400" aria-hidden="true" />
                {point}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  </section>
);

export default ProblemSolution;
