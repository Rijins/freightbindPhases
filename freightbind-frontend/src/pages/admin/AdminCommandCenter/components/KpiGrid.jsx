import StatCard from "../../../../components/Card/StatCard";
import DashboardGrid from "../../../../components/widgets/DashboardGrid";
import {
  FiActivity,
  FiAlertOctagon,
  FiAlertTriangle,
  FiCalendar,
  FiCheckCircle,
  FiHome,
  FiInbox,
  FiPackage,
  FiTruck,
} from "react-icons/fi";

/**
 * Default KPI set shown to Admin and Logistics Director: Total, Active,
 * Pending, Critical, Delayed, Delivered and Delivered Today are real,
 * pagination-derived counts kept realtime-synchronized by the dashboard slice
 * (Phase 7 Part 5); Fleet Availability and Hub Utilization are real too,
 * derived server-side from the analytics endpoint (transport vehicles in the
 * active fleet scope, hub shipment loads vs. configured capacity). A null
 * value renders as "—" (e.g. Hub Utilization before any hub has a capacity).
 *
 * Each card resolves its value through `valueKey` against `counts`,
 * `deliveredToday` or `analyticsKpis`, so role dashboards can pass their own
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
    icon: FiTruck,
    title: "Fleet Availability",
    valueKey: "fleetAvailability",
    suffix: "%",
    accent: "fleet",
    delay: 0.32,
  },
  {
    icon: FiHome,
    title: "Hub Utilization",
    valueKey: "hubUtilization",
    suffix: "%",
    accent: "analytics",
    delay: 0.36,
  },
];

const KpiGrid = ({
  loading,
  counts,
  deliveredToday,
  analyticsKpis,
  cards = DEFAULT_CARDS,
  columns = 4,
}) => {
  const resolveValue = (card) => {
    if (card.valueKey === "deliveredToday") return deliveredToday?.count;
    if (card.valueKey === "fleetAvailability") return analyticsKpis?.fleetAvailability;
    if (card.valueKey === "hubUtilization") return analyticsKpis?.hubUtilization;
    return counts?.[card.valueKey];
  };

  return (
    <DashboardGrid columns={columns}>
      {cards.map((card) => {
        const value = resolveValue(card);
        const suffix =
          card.valueKey === "deliveredToday" && deliveredToday?.capped ? "+" : card.suffix || "";
        return (
          <StatCard
            key={card.title}
            icon={card.icon}
            title={card.title}
            value={value}
            prefix={card.prefix}
            suffix={suffix}
            accent={card.accent}
            animateValue={card.animateValue}
            delay={card.delay}
            loading={loading}
            empty={value == null}
          />
        );
      })}
    </DashboardGrid>
  );
};

export default KpiGrid;
