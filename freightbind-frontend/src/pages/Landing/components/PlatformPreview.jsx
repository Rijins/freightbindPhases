import { motion } from "framer-motion";
import {
  FiBell,
  FiGrid,
  FiPackage,
  FiSearch,
  FiTruck,
  FiZap,
} from "react-icons/fi";
import Badge from "../../../components/Badges/Badge";
import StatusBadge from "../../../components/StatusBadge/StatusBadge";
import PriorityBadge from "../../../components/StatusBadge/PriorityBadge";
import PreviewBadge from "../../../components/widgets/PreviewBadge";
import AiInsightCard from "../../../components/widgets/AiInsightCard";
import MiniAreaChart from "../../../components/charts/MiniAreaChart";
import { fadeInUp, staggerContainer } from "../../../animations";

const SAMPLE_STATS = [
  { label: "Active Shipments", value: "124" },
  { label: "In Transit", value: "42" },
  { label: "At Risk of Delay", value: "6" },
  { label: "Open Notifications", value: "18" },
];

const SAMPLE_SHIPMENTS = [
  { ref: "FB-2041", route: "Shanghai → Rotterdam", status: "In Transit", priority: "High" },
  { ref: "FB-2077", route: "Hamburg → Antwerp", status: "Scheduled", priority: "Medium" },
  { ref: "FB-1988", route: "Los Angeles → Chicago", status: "Delivered", priority: "Low" },
];

const SAMPLE_FEED = [
  { text: "Status changed: In Transit (Ocean Leg)", tone: "blue" },
  { text: "AI alert: possible delay risk detected", tone: "amber" },
  { text: "Timeline event added at Rotterdam hub", tone: "cyan" },
];

const CHART_DATA = [
  { label: "Mon", value: 8 },
  { label: "Tue", value: 11 },
  { label: "Wed", value: 9 },
  { label: "Thu", value: 14 },
  { label: "Fri", value: 12 },
  { label: "Sat", value: 15 },
  { label: "Sun", value: 13 },
];

const EXAMPLE_INSIGHT = {
  title: "Delay risk detected",
  severity: "high",
  confidence: 84,
  summary:
    "The Ocean Leg is running close to the weather-sensitivity window for the destination port approach.",
  recommendation: "Re-route via the northern corridor to protect the estimated arrival.",
};

const SIDEBAR_ITEMS = [
  { label: "Dashboard", icon: FiGrid, active: true },
  { label: "Shipments", icon: FiTruck },
  { label: "Notifications", icon: FiBell },
  { label: "AI Insights", icon: FiZap },
];

/**
 * PlatformPreview — static, screenshot-like composition of the dashboard
 * shell. Reuses existing widgets (MiniAreaChart, StatusBadge, PriorityBadge,
 * AiInsightCard) fed with clearly-labeled sample data. No API calls.
 */
const PlatformPreview = () => (
  <section
    id="preview"
    aria-labelledby="preview-heading"
    className="scroll-mt-20 bg-slate-100/60 py-20 dark:bg-zinc-950 md:py-28"
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
          Platform Preview
        </Badge>
        <h2
          id="preview-heading"
          className="mt-4 font-display text-3xl font-semibold tracking-tight text-navy-900 sm:text-4xl dark:text-white"
        >
          One command center for the whole operation
        </h2>
        <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-zinc-400">
          A static look at how the platform presents live operational data. Sample values shown —
          not real system information.
        </p>
      </motion.div>

      <motion.div
        variants={staggerContainer(0.06)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.05 }}
        className="mx-auto mt-14 max-w-5xl"
      >
        <motion.div
          variants={fadeInUp}
          className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-panelHover dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="flex h-12 items-center gap-3 border-b border-slate-200/80 bg-slate-50 px-4 dark:border-zinc-800 dark:bg-zinc-900/80">
            <span className="flex gap-1.5" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </span>
            <div className="mx-auto hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1 text-xs text-slate-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500 sm:flex">
              <FiSearch size={12} aria-hidden="true" />
              app.freightbind.ai — command center
            </div>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-harbor-100 text-[10px] font-bold text-harbor-700 dark:bg-harbor-500/20 dark:text-harbor-300" aria-hidden="true">
              FB
            </span>
          </div>

          <div className="grid lg:grid-cols-[220px_1fr]">
            <aside
              className="hidden flex-col gap-1 border-r border-slate-200/80 p-4 lg:flex dark:border-zinc-800"
              aria-hidden="true"
            >
              <div className="mb-4 flex items-center gap-2 px-2">
                <FiPackage size={16} className="text-harbor-600 dark:text-harbor-400" aria-hidden="true" />
                <span className="font-display text-sm font-semibold text-navy-900 dark:text-white">
                  FreightBind <span className="text-harbor-600 dark:text-harbor-400">AI</span>
                </span>
              </div>
              {SIDEBAR_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <span
                    key={item.label}
                    className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium ${
                      item.active
                        ? "bg-harbor-50 text-harbor-700 dark:bg-harbor-500/10 dark:text-harbor-300"
                        : "text-slate-500 dark:text-zinc-400"
                    }`}
                  >
                    <Icon size={16} aria-hidden="true" />
                    {item.label}
                  </span>
                );
              })}
              <div className="mt-auto pt-6">
                <PreviewBadge label="Platform Preview" />
              </div>
            </aside>

            <div className="space-y-6 p-5 md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg font-semibold text-navy-900 dark:text-white">
                    Operations Overview
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-zinc-400">Sample data for illustration</p>
                </div>
                <PreviewBadge label="Platform Preview" className="lg:hidden" />
              </div>

              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {SAMPLE_STATS.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-[16px] border border-slate-200/80 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-zinc-500">
                      {stat.label}
                    </p>
                    <p className="mt-1.5 font-display text-2xl font-semibold tabular-nums text-navy-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                  <div className="rounded-[20px] border border-slate-200/80 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-navy-900 dark:text-white">Shipment Activity</h4>
                      <Badge tone="slate" size="sm">
                        Sample data
                      </Badge>
                    </div>
                    <MiniAreaChart data={CHART_DATA} color="#2E9385" label="Sample shipment activity chart" />
                  </div>

                  <div className="overflow-hidden rounded-[20px] border border-slate-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-zinc-800">
                      <h4 className="text-sm font-semibold text-navy-900 dark:text-white">Recent Shipments</h4>
                      <Badge tone="slate" size="sm">
                        Sample data
                      </Badge>
                    </div>
                    <ul className="divide-y divide-slate-100 dark:divide-zinc-800">
                      {SAMPLE_SHIPMENTS.map((shipment) => (
                        <li key={shipment.ref} className="flex items-center justify-between gap-3 px-5 py-3.5">
                          <div className="min-w-0">
                            <p className="truncate font-mono text-sm font-medium text-navy-900 dark:text-white">
                              {shipment.ref}
                            </p>
                            <p className="truncate text-xs text-slate-500 dark:text-zinc-400">{shipment.route}</p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <PriorityBadge priority={shipment.priority} />
                            <StatusBadge status={shipment.status} />
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-6">
                  <AiInsightCard insight={EXAMPLE_INSIGHT} />
                  <div className="rounded-[20px] border border-slate-200/80 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-navy-900 dark:text-white">Live Feed</h4>
                      <Badge tone="slate" size="sm">
                        Sample data
                      </Badge>
                    </div>
                    <ul className="space-y-3">
                      {SAMPLE_FEED.map((entry) => (
                        <li key={entry.text} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-zinc-300">
                          <span
                            className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                              entry.tone === "amber"
                                ? "bg-amber-500"
                                : entry.tone === "cyan"
                                ? "bg-cyan-500"
                                : "bg-blue-500"
                            }`}
                            aria-hidden="true"
                          />
                          {entry.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  </section>
);

export default PlatformPreview;
