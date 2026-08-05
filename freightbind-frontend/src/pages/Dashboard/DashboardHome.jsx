import useAuth from "../../hooks/useAuth";
import { ROLES } from "../../utils/constants";
import Dashboard from "./Dashboard";
import AdminCommandCenter from "../admin/AdminCommandCenter/AdminCommandCenter";
import LogisticsDirectorDashboard from "../roleDashboards/LogisticsDirectorDashboard";
import CarrierDispatcherDashboard from "../roleDashboards/CarrierDispatcherDashboard";
import HubOperatorDashboard from "../roleDashboards/HubOperatorDashboard";

/**
 * Role-switch wrapper for /dashboard. Each role gets its own Command Center
 * composition: Admins and Logistics Directors get the full enterprise view,
 * Carrier Dispatchers and Hub Operators get role-tuned KPIs, actions and
 * panels. All share the same layout, spacing, typography and animations.
 * Both pages are lazily loaded by App.jsx, so only the right bundle ships.
 */
const DashboardHome = () => {
  const { user } = useAuth();

  switch (user?.role) {
    case ROLES.ADMIN:
      return <AdminCommandCenter />;
    case ROLES.LOGISTICS_DIRECTOR:
      return <LogisticsDirectorDashboard />;
    case ROLES.CARRIER_DISPATCHER:
      return <CarrierDispatcherDashboard />;
    case ROLES.HUB_OPERATOR:
      return <HubOperatorDashboard />;
    default:
      return <Dashboard />;
  }
};

export default DashboardHome;
