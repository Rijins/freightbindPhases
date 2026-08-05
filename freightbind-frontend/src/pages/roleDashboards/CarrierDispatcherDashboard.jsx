import { useNavigate } from "react-router-dom";
import {
  FiActivity,
  FiAlertTriangle,
  FiBell,
  FiCalendar,
  FiGrid,
  FiPackage,
  FiTruck,
} from "react-icons/fi";
import RoleCommandCenter from "./RoleCommandCenter";

/**
 * CarrierDispatcherDashboard — the Command Center composition tuned for
 * dispatchers: shipment execution KPIs, fleet availability and AI routing
 * recommendations. Create Shipment is hidden (backend-gated to Admin +
 * Logistics Director); hubs are omitted since dispatchers do not run them.
 */
const CarrierDispatcherDashboard = () => {
  const navigate = useNavigate();

  const config = {
    hero: {
      description:
        "Dispatch view: shipment execution, fleet availability and AI routing recommendations.",
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
        { label: "In transit", value: counts?.["In Transit"] },
        {
          label: "Delivered today",
          value: `${deliveredToday?.count}${deliveredToday?.capped ? "+" : ""}`,
        },
        { label: "Fleet available", value: `${previewKpis.fleetAvailability}%` },
      ],
    },
    kpis: {
      columns: 3,
      cards: [
        { icon: FiPackage, title: "Total Shipments", valueKey: "total", animateValue: true, delay: 0 },
        { icon: FiActivity, title: "Active Shipments", valueKey: "active", animateValue: true, delay: 0.04 },
        { icon: FiTruck, title: "In Transit", valueKey: "In Transit", animateValue: true, delay: 0.08 },
        { icon: FiAlertTriangle, title: "Delayed", valueKey: "Delayed", animateValue: true, delay: 0.12 },
        {
          icon: FiCalendar,
          title: "Delivered Today",
          valueKey: "deliveredToday",
          animateValue: true,
          delay: 0.16,
        },
        {
          icon: FiGrid,
          title: "Fleet Availability",
          valueKey: "fleetAvailability",
          suffix: "%",
          accent: "fleet",
          preview: true,
          delay: 0.2,
        },
      ],
    },
    show: { hubs: false },
  };

  return <RoleCommandCenter config={config} />;
};

export default CarrierDispatcherDashboard;
