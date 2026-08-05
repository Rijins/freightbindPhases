import { useNavigate } from "react-router-dom";
import { FiPlusCircle, FiTruck } from "react-icons/fi";
import ContentContainer from "../../../components/page/ContentContainer";
import ErrorState from "../../../components/ErrorState/ErrorState";
import { HeroSection } from "../../../components/widgets";
import useAdminDashboardData from "./hooks/useAdminDashboardData";
import useNotifications from "../../../hooks/useNotifications";
import useAuth from "../../../hooks/useAuth";
import KpiGrid from "./components/KpiGrid";
import AiCommandCenter from "./components/AiCommandCenter";
import QuickActionsSection from "./components/QuickActionsSection";
import ShipmentOverview from "./components/ShipmentOverview";
import LiveTimeline from "./components/LiveTimeline";
import FleetStatus from "./components/FleetStatus";
import HubStatus from "./components/HubStatus";
import AnalyticsPreview from "./components/AnalyticsPreview";
import NotificationsPanel from "./components/NotificationsPanel";
import RecentActivitySection from "./components/RecentActivitySection";
import SystemHealthSection from "./components/SystemHealthSection";

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const todayLabel = () =>
  new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

/**
 * AdminCommandCenter — the Admin-only enterprise dashboard at /dashboard.
 * Real data: shipment KPIs, per-status mix, recent shipments, notifications
 * and the merged activity feed. Preview data (clearly badged): AI insights,
 * fleet, hubs, trends and system health — no backend APIs exist for those.
 */
const AdminCommandCenter = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    loading,
    error,
    counts,
    active,
    statusDistribution,
    recentShipments,
    deliveredToday,
    activity,
    aiInsights,
    fleetVehicles,
    hubs,
    systemServices,
    analyticsTrends,
    previewKpis,
    refetch,
  } = useAdminDashboardData();
  const notifications = useNotifications();

  if (error) {
    return (
      <ContentContainer>
        <ErrorState
          title="Unable to load the Command Center"
          description="Shipment data could not be fetched from the server."
          detail={error}
          onRetry={refetch}
        />
      </ContentContainer>
    );
  }

  const firstName = user?.fullName?.split(" ")[0] || "Admin";

  return (
    <ContentContainer>
      <div className="space-y-8">
        <HeroSection
          eyebrow={`${greeting()} · ${todayLabel()}`}
          title={`${firstName}'s Command Center`}
          description="A single live view of shipments, fleet, hubs and network health — with AI-assisted decisions."
          actions={[
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
          ]}
          stats={[
            { label: "Active shipments", value: active },
            {
              label: "Delivered today",
              value: `${deliveredToday?.count}${deliveredToday?.capped ? "+" : ""}`,
            },
            { label: "Fleet available", value: `${previewKpis.fleetAvailability}%` },
            { label: "Hub utilization", value: `${previewKpis.hubUtilization}%` },
          ]}
          loading={loading}
        />

        <KpiGrid
          loading={loading}
          counts={counts}
          deliveredToday={deliveredToday}
          previewKpis={previewKpis}
        />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <QuickActionsSection />
          <div className="lg:col-span-2">
            <ShipmentOverview shipments={recentShipments} loading={loading} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <LiveTimeline shipments={recentShipments} loading={loading} />
          <NotificationsPanel
            notifications={notifications.notifications}
            loading={notifications.loading}
            onMarkRead={notifications.actions.handleMarkRead}
            onMarkAllRead={notifications.actions.handleMarkAllRead}
          />
          <RecentActivitySection
            activity={activity}
            shipments={recentShipments}
            notifications={notifications.notifications}
            onViewAll={() => navigate("/shipments")}
          />
        </div>

        <AiCommandCenter insights={aiInsights} loading={loading} />

        <FleetStatus vehicles={fleetVehicles} loading={loading} />

        <HubStatus hubs={hubs} loading={loading} />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <AnalyticsPreview
              statusDistribution={statusDistribution}
              shipmentVolume={analyticsTrends.shipmentVolume}
              loading={loading}
            />
          </div>
          <SystemHealthSection services={systemServices} loading={loading} />
        </div>
      </div>
    </ContentContainer>
  );
};

export default AdminCommandCenter;
