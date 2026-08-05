import { useNavigate } from "react-router-dom";
import ContentContainer from "../../components/page/ContentContainer";
import ErrorState from "../../components/ErrorState/ErrorState";
import { HeroSection } from "../../components/widgets";
import useAdminDashboardData from "../admin/AdminCommandCenter/hooks/useAdminDashboardData";
import useNotifications from "../../hooks/useNotifications";
import useAuth from "../../hooks/useAuth";
import KpiGrid from "../admin/AdminCommandCenter/components/KpiGrid";
import AiCommandCenter from "../admin/AdminCommandCenter/components/AiCommandCenter";
import QuickActionsSection from "../admin/AdminCommandCenter/components/QuickActionsSection";
import ShipmentOverview from "../admin/AdminCommandCenter/components/ShipmentOverview";
import LiveTimeline from "../admin/AdminCommandCenter/components/LiveTimeline";
import FleetStatus from "../admin/AdminCommandCenter/components/FleetStatus";
import HubStatus from "../admin/AdminCommandCenter/components/HubStatus";
import AnalyticsPreview from "../admin/AdminCommandCenter/components/AnalyticsPreview";
import NotificationsPanel from "../admin/AdminCommandCenter/components/NotificationsPanel";
import RecentActivitySection from "../admin/AdminCommandCenter/components/RecentActivitySection";
import SystemHealthSection from "../admin/AdminCommandCenter/components/SystemHealthSection";

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
 * RoleCommandCenter — shared dashboard shell for the non-admin roles. The
 * Admin Command Center (AdminCommandCenter) is the reference design; this
 * composes the exact same sections, spacing, typography, animations and
 * responsive behaviour, driven by a per-role config so only widgets,
 * actions, permissions and content change:
 *
 * config: {
 *   hero: { title?, description, actions, stats | (data) => [...] },
 *   kpis: { cards?, columns? },            // KpiGrid card configs
 *   show: { ai?, fleet?, hubs?, analytics? } // panel toggles, default true
 * }
 *
 * `data` passed to a function `hero.stats` is
 * { active, counts, deliveredToday, previewKpis }.
 */
const RoleCommandCenter = ({ config }) => {
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
  const { hero = {}, kpis = {}, show = {} } = config || {};

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
  const stats =
    typeof hero.stats === "function"
      ? hero.stats({ active, counts, deliveredToday, previewKpis })
      : hero.stats || [];

  return (
    <ContentContainer>
      <div className="space-y-8">
        <HeroSection
          eyebrow={hero.eyebrow || `${greeting()} · ${todayLabel()}`}
          title={hero.title || `${firstName}'s Command Center`}
          description={hero.description}
          actions={hero.actions || []}
          stats={stats}
          loading={loading}
        />

        <KpiGrid
          loading={loading}
          counts={counts}
          deliveredToday={deliveredToday}
          previewKpis={previewKpis}
          cards={kpis.cards}
          columns={kpis.columns}
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

        {show.ai !== false && <AiCommandCenter insights={aiInsights} loading={loading} />}

        {show.fleet !== false && <FleetStatus vehicles={fleetVehicles} loading={loading} />}

        {show.hubs !== false && <HubStatus hubs={hubs} loading={loading} />}

        {show.analytics !== false && (
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
        )}
      </div>
    </ContentContainer>
  );
};

export default RoleCommandCenter;
