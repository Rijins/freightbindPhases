import { useEffect, useState } from "react";
import {
  FiAlertOctagon,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiTrendingUp,
  FiZap,
} from "react-icons/fi";
import StatCard from "../../../../components/Card/StatCard";
import DashboardGrid from "../../../../components/widgets/DashboardGrid";

const REFRESH_LABEL_INTERVAL_MS = 60000;

const formatRelative = (timestamp) => {
  if (!timestamp) return "—";
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000));
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const CARD_CONFIG = [
  {
    key: "total",
    icon: FiZap,
    title: "AI Analyses",
    accent: "ai",
  },
  {
    key: "highRisk",
    icon: FiAlertOctagon,
    title: "High Risk",
    accent: "reports",
  },
  {
    key: "mediumRisk",
    icon: FiAlertTriangle,
    title: "Medium Risk",
    accent: "notifications",
  },
  {
    key: "lowRisk",
    icon: FiCheckCircle,
    title: "Low Risk",
    accent: "analytics",
  },
  {
    key: "avgConfidence",
    icon: FiTrendingUp,
    title: "Avg Confidence",
    suffix: "%",
    accent: "ai",
  },
  {
    key: "lastRefreshAt",
    icon: FiClock,
    title: "Last AI Refresh",
    accent: "timeline",
  },
];

/**
 * AiOverview — live intelligence summary for the AI Command Center
 * (Phase 8 Part 4). Pure StatCard composition over the analysis stats
 * derived from the AI hooks; no AI logic, no redesign — same card shell,
 * spacing and accents as the rest of the dashboard.
 *
 * Props: stats { total, highRisk, mediumRisk, lowRisk, avgConfidence,
 *   lastRefreshAt }, loading.
 */
const AiOverview = ({ stats = {}, loading = false }) => {
  const lastRefreshAt = stats.lastRefreshAt || null;
  const [, setTick] = useState(0);

  // Keep the relative "Last AI refresh" label fresh without polling the
  // server — a local 60s re-render is enough for a human-friendly label.
  useEffect(() => {
    if (!lastRefreshAt) return undefined;
    const id = setInterval(() => setTick((t) => t + 1), REFRESH_LABEL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [lastRefreshAt]);

  return (
    <DashboardGrid columns={3}>
      {CARD_CONFIG.map((card) => {
        const value =
          card.key === "lastRefreshAt"
            ? formatRelative(lastRefreshAt)
            : Number(stats[card.key]) || 0;
        return (
          <StatCard
            key={card.key}
            icon={card.icon}
            title={card.title}
            value={value}
            suffix={card.suffix}
            accent={card.accent}
            loading={loading}
            animateValue={card.key !== "lastRefreshAt" && !loading}
          />
        );
      })}
    </DashboardGrid>
  );
};

export default AiOverview;
