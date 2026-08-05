import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import shipmentService from "../../../../services/shipmentService";
import { ROLES, SHIPMENT_STATUSES } from "../../../../utils/constants";
import { parseApiError } from "../../../../utils/helpers";
import useAuth from "../../../../hooks/useAuth";
import useDashboardSync from "../../../../hooks/useDashboardSync";
import {
  PENDING_STATUSES,
  computeActiveCount,
  dashboardLoaded,
} from "../../../../features/dashboard/dashboardSlice";
import {
  AI_INSIGHTS,
  ANALYTICS_TRENDS,
  FLEET_VEHICLES,
  HUBS,
  PENDING_APPROVALS_COUNT,
  SYSTEM_SERVICES,
} from "../data/previewData";

const DELIVERED_SCAN_LIMIT = 50;
const RECENT_LIMIT = 6;

const startOfToday = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
};

/**
 * useAdminDashboardData — single source of truth for every Command Center
 * (Admin, Logistics Director, Carrier Dispatcher, Hub Operator). Shipment
 * KPIs, per-status distribution and recent shipments are REAL (derived from
 * GET /api/v1/shipments pagination totals) and live in the `dashboard` Redux
 * slice, which Phase 7 Part 5's useDashboardSync keeps realtime-synchronized
 * (KPI cards, Shipment Overview, Recent Activity, reconnect recovery).
 * Fleet, hubs, AI, trends and health are clearly labelled preview data since
 * no backend API exists for them yet.
 *
 * Carrier Dispatchers load a role-scoped dataset (assignedDispatcher = me),
 * so their KPIs and overview only reflect assigned shipments — the same scope
 * useDashboardSync enforces for socket events. Admins, Logistics Directors
 * and Hub Operators see the organization-wide dataset (Hub Operators have no
 * hub-scoped filter — the backend has no hub field on shipments).
 *
 * Returns { loading, error, counts, active, statusDistribution,
 *   recentShipments, deliveredToday, activity, aiInsights, fleetVehicles,
 *   hubs, systemServices, analyticsTrends, previewKpis, refetch }.
 */
const useAdminDashboardData = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  // Realtime-synced dashboard state (Phase 7 Part 5).
  const dashboard = useSelector((state) => state.dashboard);

  // Role scope: Carrier Dispatchers only see their assigned shipments. The
  // backend's GET /shipments already supports the assignedDispatcher filter;
  // no new API and no RBAC changes.
  const scope = useMemo(() => {
    if (user?.role === ROLES.CARRIER_DISPATCHER && user?._id) {
      return { assignedDispatcher: user._id };
    }
    return null;
  }, [user?.role, user?._id]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const baseParams = scope || {};
      const [totalRes, ...statusResults] = await Promise.all([
        shipmentService.getShipments({ ...baseParams, limit: 1 }),
        ...SHIPMENT_STATUSES.map((status) =>
          shipmentService.getShipments({ ...baseParams, status, limit: 1 })
        ),
        shipmentService.getShipments({ ...baseParams, priority: "Critical", limit: 1 }),
        shipmentService.getShipments({
          ...baseParams,
          limit: RECENT_LIMIT,
          sortBy: "createdAt",
          order: "desc",
        }),
        shipmentService.getShipments({
          ...baseParams,
          status: "Delivered",
          limit: DELIVERED_SCAN_LIMIT,
          sortBy: "updatedAt",
          order: "desc",
        }),
      ]);

      if (!mountedRef.current) return;

      const statusCounts = {};
      SHIPMENT_STATUSES.forEach((status, idx) => {
        statusCounts[status] = statusResults[idx].pagination.totalItems;
      });

      const criticalRes = statusResults[SHIPMENT_STATUSES.length];
      const recentRes = statusResults[SHIPMENT_STATUSES.length + 1];
      const deliveredRes = statusResults[SHIPMENT_STATUSES.length + 2];

      const today = startOfToday();
      const todayDeliveries = deliveredRes.shipments.filter((s) => {
        const arrival = s.actualArrival ? new Date(s.actualArrival) : null;
        return arrival && !Number.isNaN(arrival.getTime()) && arrival >= today;
      }).length;

      dispatch(
        dashboardLoaded({
          counts: {
            total: totalRes.pagination.totalItems,
            active: computeActiveCount(statusCounts),
            Pending: PENDING_STATUSES.reduce(
              (sum, status) => sum + (statusCounts[status] || 0),
              0
            ),
            Critical: criticalRes.pagination.totalItems,
            ...statusCounts,
          },
          statusDistribution: SHIPMENT_STATUSES.map((status) => ({
            label: status,
            value: statusCounts[status],
          })),
          recentShipments: recentRes.shipments,
          deliveredToday: {
            count: todayDeliveries,
            capped:
              todayDeliveries >= DELIVERED_SCAN_LIMIT &&
              deliveredRes.shipments.length === DELIVERED_SCAN_LIMIT,
          },
          scope,
        })
      );
    } catch (err) {
      if (mountedRef.current) setError(parseApiError(err).message);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [dispatch, scope]);

  useEffect(() => {
    mountedRef.current = true;
    load();
    return () => {
      mountedRef.current = false;
    };
  }, [load]);

  // Phase 7 Part 5: mounts the reusable dashboard synchronization hook —
  // socket events flow into the dashboard slice; reconnect re-runs the seed.
  useDashboardSync({ onRefresh: load, scope });

  const { counts } = dashboard;

  const active = counts ? computeActiveCount(counts) : 0;

  const availableFleet = FLEET_VEHICLES.filter((v) => v.status === "Available").length;
  const fleetAvailabilityPct = Math.round((availableFleet / FLEET_VEHICLES.length) * 100);
  const hubUtilizationPct = Math.round(
    HUBS.reduce((sum, h) => sum + ((h.currentLoad || 0) / h.capacity) * 100, 0) / HUBS.length
  );

  const previewKpis = {
    pendingApprovals: PENDING_APPROVALS_COUNT,
    fleetAvailability: fleetAvailabilityPct,
    hubUtilization: hubUtilizationPct,
  };

  return {
    loading,
    error,
    counts,
    active,
    statusDistribution: dashboard.statusDistribution,
    recentShipments: dashboard.recentShipments,
    deliveredToday: dashboard.deliveredToday,
    activity: dashboard.activity,
    aiInsights: AI_INSIGHTS,
    fleetVehicles: FLEET_VEHICLES,
    hubs: HUBS,
    systemServices: SYSTEM_SERVICES,
    analyticsTrends: ANALYTICS_TRENDS,
    previewKpis,
    refetch: load,
  };
};

export default useAdminDashboardData;
