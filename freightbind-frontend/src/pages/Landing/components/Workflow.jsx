import { motion } from "framer-motion";
import {
  FiAnchor,
  FiArchive,
  FiCheckCircle,
  FiLayers,
  FiPlusCircle,
  FiRepeat,
  FiTruck,
} from "react-icons/fi";
import Badge from "../../../components/Badges/Badge";
import { cn } from "../../../utils/cn";
import { fadeInUp, staggerContainer } from "../../../animations";

const WORKFLOW_STEPS = [
  { label: "Created", description: "Shipment record opened with origin, destination and dates", icon: FiPlusCircle },
  { label: "Ocean Leg", description: "Vessel transit with live status updates", icon: FiAnchor },
  { label: "Port Handoff", description: "Container released and handed to the next leg", icon: FiRepeat },
  { label: "Rail Leg", description: "Intermodal rail movement across the network", icon: FiLayers },
  { label: "Yard Handoff", description: "Arrival at the hub yard for staging", icon: FiArchive },
  { label: "Truck Leg", description: "Final-mile road transport to the destination", icon: FiTruck },
  { label: "Delivered", description: "Delivery confirmed and recorded on the timeline", icon: FiCheckCircle, final: true },
];

/**
 * Workflow — illustrative shipment lifecycle (Created → … → Delivered).
 * Marketing composition only; not connected to live backend data.
 */
const Workflow = () => (
  <section
    id="workflow"
    aria-labelledby="workflow-heading"
    className="scroll-mt-20 bg-slate-50 py-20 dark:bg-zinc-900/30 md:py-28"
  >
    <div className="mx-auto w-full max-w-6xl px-4 md:px-8">
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="mx-auto max-w-2xl text-center"
      >
        <Badge tone="custom" className="bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
          How It Works
        </Badge>
        <h2
          id="workflow-heading"
          className="mt-4 font-display text-3xl font-semibold tracking-tight text-navy-900 sm:text-4xl dark:text-white"
        >
          A clear lifecycle for every shipment
        </h2>
        <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-zinc-400">
          Every handoff is recorded and visible to the teams that need it — example lifecycle
          shown here for illustration.
        </p>
      </motion.div>

      <div className="relative mt-16">
        <motion.span
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="absolute bottom-4 left-5 top-4 w-px origin-top bg-slate-200 dark:bg-zinc-700 lg:left-1/2 lg:-translate-x-1/2"
          aria-hidden="true"
        />

        <motion.ol
          variants={staggerContainer(0.08)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.05 }}
          className="space-y-10 lg:space-y-14"
        >
          {WORKFLOW_STEPS.map((step, index) => {
            const Icon = step.icon;
            const onLeft = index % 2 === 0;
            return (
              <motion.li key={step.label} variants={fadeInUp} className="relative lg:grid lg:grid-cols-2 lg:gap-20">
                <span
                  className={cn(
                    "absolute left-5 top-7 z-10 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full border-4 bg-white dark:bg-zinc-950 lg:left-1/2",
                    step.final
                      ? "border-emerald-500"
                      : "border-harbor-500 dark:border-harbor-400"
                  )}
                  aria-hidden="true"
                />
                <div
                  className={cn(
                    "pl-12 lg:pl-0",
                    onLeft ? "lg:col-start-1" : "lg:col-start-2 lg:row-start-1"
                  )}
                >
                  <div
                    className={cn(
                      "rounded-[20px] border border-slate-200/80 bg-white p-5 shadow-panel transition-shadow duration-150 hover:shadow-panelHover dark:border-zinc-800 dark:bg-zinc-900",
                      !onLeft && "lg:text-right"
                    )}
                  >
                    <div className={cn("flex items-center gap-3", !onLeft && "lg:flex-row-reverse")}>
                      <span
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                          step.final
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                            : "bg-harbor-50 text-harbor-600 dark:bg-harbor-500/10 dark:text-harbor-400"
                        )}
                      >
                        <Icon size={18} aria-hidden="true" />
                      </span>
                      <div>
                        <h3 className="font-display text-base font-semibold text-navy-900 dark:text-white">
                          {step.label}
                        </h3>
                        <p className="mt-0.5 text-sm text-slate-500 dark:text-zinc-400">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.li>
            );
          })}
        </motion.ol>
      </div>
    </div>
  </section>
);

export default Workflow;
