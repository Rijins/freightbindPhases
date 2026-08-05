import { useNavigate } from "react-router-dom";
import {
  FiActivity,
  FiAlertTriangle,
  FiBell,
  FiCalendar,
  FiCheckCircle,
  FiHome,
  FiPackage,
  FiTruck,
} from "react-icons/fi";
import RoleCommandCenter from "./RoleCommandCenter";

/**
 * HubOperatorDashboard — the Command Center composition tuned for hub
 * operators: facility capacity, live shipment load and AI hub forecasts.
 * Create Shipment is hidden (backend-gated to Admin + Logistics Director);
 * fleet is omitted since hub operators do not run the fleet.
 */
const HubOperatorDashboard = () => {
  const navigate = useNavigate();

  const config = {
    hero: {
      description:
        "Hub view: facility capacity, live shipment load and AI hub forecasts.",
      actions: [
        {
          label: "All Shipments",
          icon: FiTruck,
          primary: true,
          onClick: () => navigate("/shipments"),
        },
        {
          label: "Notifications",
          icon: FiBell,
          primary: false,
          onClick: () => navigate("/notifications"),
        },
      ],
      stats: ({ active, counts, deliveredToday, previewKpis }) => [
        { label: "Active shipments", value: active },
        { label: "Delayed", value: counts?.["Delayed"] },
        {
          label: "Delivered today",
          value: `${deliveredToday?.count}${deliveredToday?.capped ? "+" : ""}`,
        },
        { label: "Hub utilization", value: `${previewKpis.hubUtilization}%` },
      ],
    },
    kpis: {
      columns: 3,
      cards: [
        { icon: FiPackage, title: "Total Shipments", valueKey: "total", animateValue: true, delay: 0 },
        { icon: FiActivity, title: "Active Shipments", valueKey: "active", animateValue: true, delay: 0.04 },
        { icon: FiAlertTriangle, title: "Delayed", valueKey: "Delayed", animateValue: true, delay: 0.08 },
        { icon: FiCheckCircle, title: "Delivered", valueKey: "Delivered", animateValue: true, delay: 0.12 },
        {
          icon: FiCalendar,
          title: "Delivered Today",
          valueKey: "deliveredToday",
          animateValue: true,
          delay: 0.16,
        },
        {
          icon: FiHome,
          title: "Hub Utilization",
          valueKey: "hubUtilization",
          suffix: "%",
          accent: "analytics",
          preview: true,
          delay: 0.2,
        },
      ],
    },
    show: { fleet: false },
  };

  return <RoleCommandCenter config={config} />;
};

export default HubOperatorDashboard;
