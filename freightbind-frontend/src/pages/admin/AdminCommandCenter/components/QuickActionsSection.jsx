import { useNavigate } from "react-router-dom";
import { FiBell, FiGrid, FiMapPin, FiPlusCircle, FiTruck, FiZap } from "react-icons/fi";
import QuickActionsWidget from "../../../../components/widgets/QuickActionsWidget";
import { CAN_CREATE_SHIPMENT_ROLES } from "../../../../utils/constants";
import { MODULE_ACCENTS } from "../../../../utils/themeTokens";

/**
 * QuickActionsSection — role-gated shortcuts. Real destinations (shipments,
 * notifications) navigate; fleet/hubs/AI have no pages yet, so those actions
 * are disabled with a hint instead of leading nowhere. QuickActionsWidget
 * hides any action whose `roles` exclude the current user.
 */
const QuickActionsSection = () => {
  const navigate = useNavigate();

  const actions = [
    {
      id: "qa-shipments",
      label: "All Shipments",
      description: "Review every shipment in the network",
      icon: FiTruck,
      onClick: () => navigate("/shipments"),
    },
    {
      id: "qa-create",
      label: "Create Shipment",
      description: "Draft and dispatch a new shipment",
      icon: FiPlusCircle,
      roles: CAN_CREATE_SHIPMENT_ROLES,
      onClick: () => navigate("/shipments/create"),
    },
    {
      id: "qa-notifications",
      label: "Notifications",
      description: "Inbox, filters and unread items",
      icon: FiBell,
      onClick: () => navigate("/notifications"),
    },
    {
      id: "qa-fleet",
      label: "Fleet Overview",
      description: "Fleet module — coming in a later phase",
      icon: FiGrid,
      accent: MODULE_ACCENTS.fleet.text,
      disabled: true,
    },
    {
      id: "qa-hubs",
      label: "Hub Network",
      description: "Hub module — coming in a later phase",
      icon: FiMapPin,
      accent: MODULE_ACCENTS.analytics.text,
      disabled: true,
    },
    {
      id: "qa-ai",
      label: "AI Advisor",
      description: "AI module — coming in a later phase",
      icon: FiZap,
      accent: MODULE_ACCENTS.ai.text,
      disabled: true,
    },
  ];

  return (
    <QuickActionsWidget
      title="Quick Actions"
      subtitle="Shortcuts for the most common admin tasks."
      actions={actions}
      columns={2}
    />
  );
};

export default QuickActionsSection;
