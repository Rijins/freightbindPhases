import {
  FiActivity,
  FiAlertOctagon,
  FiAlertTriangle,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiHome,
  FiInbox,
  FiPackage,
  FiTruck,
} from "react-icons/fi";
import StatCard from "../../../../components/Card/StatCard";
import DashboardGrid from "../../../../components/widgets/DashboardGrid";
import PreviewBadge from "../../../../components/widgets/PreviewBadge";

/**
 * Default KPI set shown to Admin and Logistics Director: Total, Active,
 * Pending, Critical, Delayed, Delivered and Delivered Today are real,
 * pagination-derived counts kept realtime-synchronized by the dashboard slice
 * (Phase 7 Part 5); Pending Approvals, Fleet Availability and Hub Utilization
 * are preview values (no backend API exists yet) and are marked with
 * PreviewBadge.
 *
 * Each card resolves its value through `valueKey` against `counts`,
 * `deliveredToday` or `previewKpis`, so role dashboards can pass their own
 * `cards` (and `columns`) while keeping the exact same card rendering.
 */
const DEFAULT_CARDS = [
  { icon: FiPackage, title: "Total Shipments", valueKey: "total", animateValue: true, delay: 0 },
  { icon: FiActivity, title: "Active Shipments", valueKey: "active", animateValue: true, delay: 0.04 },
  { icon: FiInbox, title: "Pending Shipments", valueKey: "Pending", animateValue: true, delay: 0.08 },
  { icon: FiAlertOctagon, title: "Critical", valueKey: "Critical", animateValue: true, delay: 0.12 },
  { icon: FiAlertTriangle, title: "Delayed", valueKey: "Delayed", animateValue: true, delay: 0.16 },
  { icon: FiCheckCircle, title: "Delivered", valueKey: "Delivered", animateValue: true, delay: 0.2 },
  {
    icon: FiCalendar,
    title: "Delivered Today",
    valueKey: "deliveredToday",
    animateValue: true,
    delay: 0.24,
  },
  {
    icon: FiClock,
    title: "Pending Approvals",
    valueKey: "pendingApprovals",
    accent: "ai",
    preview: true,
    delay: 0.28,
  },
  {
    icon: FiTruck,
    title: "Fleet Availability",
    valueKey: "fleetAvailability",
    suffix: "%",
    accent: "fleet",
    preview: true,
    delay: 0.32,
  },
  {
    icon: FiHome,
    title: "Hub Utilization",
    valueKey: "hubUtilization",
    suffix: "%",
    accent: "analytics",
    preview: true,
    delay: 0.36,
  },
];

const KpiGrid = ({
  loading,
  counts,
  deliveredToday,
  previewKpis,
  cards = DEFAULT_CARDS,
  columns = 4,
}) => {
  const resolveValue = (card) => {
    if (card.valueKey === "deliveredToday") return deliveredToday?.count;
    if (card.valueKey === "pendingApprovals") return previewKpis?.pendingApprovals;
    if (card.valueKey === "fleetAvailability") return previewKpis?.fleetAvailability;
    if (card.valueKey === "hubUtilization") return previewKpis?.hubUtilization;
    return counts?.[card.valueKey];
  };

  return (
    <DashboardGrid columns={columns}>
      {cards.map((card) => {
        const suffix =
          card.valueKey === "deliveredToday" && deliveredToday?.capped ? "+" : card.suffix || "";
        return (
          <div key={card.title} className="relative">
            <StatCard
              icon={card.icon}
              title={card.title}
              value={resolveValue(card)}
              prefix={card.prefix}
              suffix={suffix}
              accent={card.accent}
              animateValue={card.animateValue}
              delay={card.delay}
              loading={loading}
            />
            {card.preview && (
              <PreviewBadge className="absolute -top-2 right-4 z-10" />
            )}
          </div>
        );
      })}
    </DashboardGrid>
  );
};

export default KpiGrid;
