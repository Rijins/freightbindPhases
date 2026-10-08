import { motion } from "framer-motion";
import AiSummaryCard from "../../../components/widgets/AiSummaryCard";
import AiInsightCard from "../../../components/widgets/AiInsightCard";
import PreviewBadge from "../../../components/widgets/PreviewBadge";
import { fadeInUp, staggerContainer } from "../../../animations";

const EXAMPLE_SUMMARY = {
  overview:
    "Shipment FB-2041 is mid Ocean Leg, tracking close to the plan with a healthy buffer before the port handoff.",
  milestones: [
    "Departed origin port on schedule",
    "Vessel position matches the planned route",
    "Documents cleared for the destination port",
  ],
  currentProgress: "Ocean Leg is 62% complete — estimated arrival unchanged.",
  concerns: [
    "Weather window at the destination port may narrow the arrival buffer",
    "Yard capacity is tighter than usual for the handoff week",
  ],
  nextAction: "Pre-book the truck leg now to protect the final-mile slot.",
};

const EXAMPLE_INSIGHTS = [
  {
    title: "Delay risk detected",
    severity: "high",
    confidence: 84,
    summary:
      "The Ocean Leg is running close to the weather-sensitivity window for the destination port approach.",
    recommendation: "Re-route via the northern corridor to protect the estimated arrival.",
  },
  {
    title: "Handoff capacity",
    severity: "medium",
    confidence: 72,
    summary:
      "Port handoff availability at the destination yard may tighten around the estimated arrival window.",
    recommendation: "Pre-book the rail slot 48 hours ahead to keep the next leg moving.",
  },
];

/**
 * AIIntelligence — marketing section for the AI capabilities. Uses the real
 * AiSummaryCard / AiInsightCard components fed with static example content;
 * clearly labeled as an example. No AI API calls are made.
 */
const AIIntelligence = () => (
  <section
    id="ai"
    aria-labelledby="ai-heading"
    className="scroll-mt-20 bg-gradient-to-b from-indigo-50/50 to-white py-20 dark:bg-zinc-950 md:py-28"
  >
    <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="mx-auto max-w-2xl text-center"
      >
        <div className="flex items-center justify-center gap-2">
          <PreviewBadge label="Example" />
        </div>
        <h2
          id="ai-heading"
          className="mt-4 font-display text-3xl font-semibold tracking-tight text-navy-900 sm:text-4xl dark:text-white"
        >
          AI Intelligence on top of live operations
        </h2>
        <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-zinc-400">
          Delay risk prediction, shipment summaries, risk levels, confidence scores, reasons and
          recommendations — generated from operational data. What you see below is a static
          example of how it appears in the platform.
        </p>
      </motion.div>

      <motion.div
        variants={staggerContainer(0.08)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="mt-14 grid gap-6 lg:grid-cols-5"
      >
        <motion.div variants={fadeInUp} className="lg:col-span-3">
          <AiSummaryCard summary={EXAMPLE_SUMMARY} title="Shipment Summary" />
        </motion.div>
        <motion.div variants={fadeInUp} className="space-y-6 lg:col-span-2">
          {EXAMPLE_INSIGHTS.map((insight) => (
            <AiInsightCard key={insight.title} insight={insight} />
          ))}
        </motion.div>
      </motion.div>
    </div>
  </section>
);

export default AIIntelligence;
