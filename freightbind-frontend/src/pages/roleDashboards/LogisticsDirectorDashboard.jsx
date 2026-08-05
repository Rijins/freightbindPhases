import { useNavigate } from "react-router-dom";
import { FiPlusCircle, FiTruck } from "react-icons/fi";
import RoleCommandCenter from "./RoleCommandCenter";

/**
 * LogisticsDirectorDashboard — mirrors the Admin Command Center layout
 * (same sections, spacing, typography, animations and responsive behaviour)
 * with the shared create/update permissions of the Logistics Director role.
 */
const LogisticsDirectorDashboard = () => {
  const navigate = useNavigate();

  const config = {
    hero: {
      description:
        "A single live view of shipments, fleet, hubs and network health — with AI-assisted decisions.",
      actions: [
        {
          label: "Create Shipment",
          icon: FiPlusCircle,
          primary: true,
          onClick: () => navigate("/shipments/create"),
        },
        {
          label: "All Shipments",
          icon: FiTruck,
          primary: false,
          onClick: () => navigate("/shipments"),
        },
      ],
      stats: ({ active, deliveredToday, previewKpis }) => [
        { label: "Active shipments", value: active },
        {
          label: "Delivered today",
          value: `${deliveredToday?.count}${deliveredToday?.capped ? "+" : ""}`,
        },
        { label: "Fleet available", value: `${previewKpis.fleetAvailability}%` },
        { label: "Hub utilization", value: `${previewKpis.hubUtilization}%` },
      ],
    },
    kpis: {},
  };

  return <RoleCommandCenter config={config} />;
};

export default LogisticsDirectorDashboard;
