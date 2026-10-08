import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import shipmentService from "../../../../services/shipmentService";
import aiService from "../../../../services/aiService";
import analyticsService from "../../../../services/analyticsService";
import { ROLES, SHIPMENT_STATUSES } from "../../../../utils/constants";
import { parseApiError } from "../../../../utils/helpers";
import useAuth from "../../../../hooks/useAuth";
import useDashboardSync from "../../../../hooks/useDashboardSync";
import useAIIntelligenceSync from "../../../../hooks/useAIIntelligenceSync";
import useDelayRisk from "../../../../hooks/useDelayRisk";
import useShipmentSummary from "../../../../hooks/useShipmentSummary";
import useAIRecommendations from "../../../../hooks/useAIRecommendations";
import {
  PENDING_STATUSES,
  computeActiveCount,
  dashboardLoaded,
} from "../../../../features/dashboard/dashboardSlice";

const DELIVERED_SCAN_LIMIT = 50;
const RECENT_LIMIT = 6;
const PREDICTION_SLOTS = 4;
// AI candidate pool: a wider, updatedAt-desc slice of shipments the AI
// section ranks by importance. Bigger than the 6-row overview window so a
// shipment that changed long ago can still surface when it becomes risky.
const AI_POOL_LIMIT = 12;
// Upsert cap: a burst of unrelated socket events must never balloon the pool.
const AI_POOL_MAX = 16;

const startOfToday = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
};

// Delay-risk cards surface on the existing AI insight panel. Importance is
// scored from LIVE shipment fields (the same inputs the AI predicts on), so
// the ordering is never static and socket-synced rows re-rank automatically.
// Priority order: High Risk (Delayed / overdue) -> Critical priority ->
// recently delayed -> recently updated -> recency tiebreak.
const scoreShipment = (shipment) => {
  if (!shipment) return -1;
  let score = 0;
  if (shipment.status === "Delayed") score += 400;
  else if (shipment.status === "In Transit") score += 250;

  const isTerminal = ["Delivered", "Cancelled"].includes(shipment.status);
  const estimatedArrival = shipment.estimatedArrival
    ? new Date(shipment.estimatedArrival)
    : null;
  if (
    estimatedArrival &&
    !Number.isNaN(estimatedArrival.getTime()) &&
    !isTerminal &&
    estimatedArrival.getTime() < Date.now()
  ) {
    score += 300; // overdue
  }

  if (shipment.priority === "Critical") score += 200;
  else if (shipment.priority === "High") score += 100;

  const updatedAt = shipment.updatedAt ? new Date(shipment.updatedAt) : null;
  const hoursSinceUpdate = updatedAt && !Number.isNaN(updatedAt.getTime())
    ? (Date.now() - updatedAt.getTime()) / 3600000
    : Infinity;
  if (shipment.status === "Delayed" && hoursSinceUpdate < 24) score += 80; // recently delayed
  if (hoursSinceUpdate < 24) score += 40; // recently updated
  else if (hoursSinceUpdate < 168) score += 20;

  return score;
};

const selectCandidates = (pool) => {
  const shipments = Array.isArray(pool) ? pool : [];
  return [...shipments]
    .sort((a, b) => {
      const byScore = scoreShipment(b) - scoreShipment(a);
      if (byScore !== 0) return byScore;
      return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
    })
    .slice(0, PREDICTION_SLOTS);
};

// AiInsightCard shape (components/widgets/AiInsightCard.jsx):
// { _id, title, summary?, recommendation, severity, confidence, detail? }
const RISK_TO_SEVERITY = { Low: "low", Medium: "medium", High: "high" };

const predictionToInsight = (shipment, prediction, summary) => ({
  _id: `delay-risk:${shipment._id}`,
  title: `Delay risk — ${shipment.title || shipment.shipmentId || "Shipment"}`,
  severity: RISK_TO_SEVERITY[prediction.risk] || "low",
  summary: prediction.summary,
  recommendation: prediction.recommendations?.[0] || undefined,
  confidence: Math.round((prediction.confidence || 0) * 100),
  // Shipment intelligence: compact progress + next action from the AI
  // shipment summary, so every card carries the full picture.
  detail: {
    progress: summary?.currentProgress,
    nextAction: summary?.nextAction,
  },
});

/**
 * useAdminDashboardData — single source of truth for every Command Center
 * (Admin, Logistics Director, Carrier Dispatcher, Hub Operator). Shipment
 * KPIs, per-status distribution and recent shipments are REAL (derived from
 * GET /api/v1/shipments pagination totals) and live in the `dashboard` Redux
 * slice, which Phase 7 Part 5's useDashboardSync keeps realtime-synchronized
 * (KPI cards, Shipment Overview, Recent Activity, reconnect recovery).
 *
 * Fleet, hubs, system health and the volume trend are REAL too — they come
 * from GET /api/analytics/dashboard, which derives them server-side from the
 * Shipment and Hub collections (role-scoped). An analytics outage never
 * breaks the dashboard: shipment KPIs load independently and the analytics
 * sections simply render their empty states.
 *
 * Phase 8 Part 4 — AI Dashboard Intelligence:
 *   - A live AI candidate pool (wider updatedAt-desc seed + socket-event
 *     upserts) is ranked by importance so the AI cards always represent the
 *     most important shipments (High Risk -> Critical -> recent delay ->
 *     recent update), never a static list.
 *   - 4 delay-risk + 4 shipment-summary slots (all via the existing AI
 *     hooks, deduped + TTL-cached by the shared aiClient).
 *   - useAIIntelligenceSync targets the affected shipment on status / timeline
 *     / assignment changes: only its aiClient entries are evicted and only
 *     its analysis re-runs — no polling, no whole-dashboard refresh.
 *   - Derived aiOverview stats and ranked aiRecommendations for the AI
 *     Command Center sections (zero extra requests).
 *
 * Returns { loading, error, counts, active, statusDistribution,
 *   recentShipments, deliveredToday, activity, aiInsights, aiSummary,
 *   aiOverview, aiRecommendations, aiRecommendationsLoading,
 *   aiRecommendationsError, onRetryRecommendations, aiError,
 *   fleetVehicles, hubs, systemServices, analyticsTrends, analyticsKpis,
 *   refetch }.
 */
const useAdminDashboardData = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);
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

  // AI candidate pool (ref so socket upserts never trigger unrelated
  // renders) + a version counter so the ranked candidate memo re-computes
  // only when the pool actually changed.
  const aiPoolRef = useRef(new Map());
  const [aiPoolVersion, setAiPoolVersion] = useState(0);

  const replacePool = useCallback((shipments) => {
    const pool = new Map();
    for (const shipment of Array.isArray(shipments) ? shipments : []) {
      if (shipment?._id) pool.set(shipment._id, shipment);
    }
    aiPoolRef.current = pool;
    setAiPoolVersion((version) => version + 1);
  }, []);

  const upsertPool = useCallback((shipment) => {
    if (!shipment?._id) return;
    const pool = new Map(aiPoolRef.current);
    pool.set(shipment._id, shipment);
    if (pool.size > AI_POOL_MAX) {
      const trimmed = [...pool.values()]
        .sort((a, b) => scoreShipment(b) - scoreShipment(a))
        .slice(0, AI_POOL_MAX);
      pool.clear();
      for (const s of trimmed) pool.set(s._id, s);
    }
    aiPoolRef.current = pool;
    setAiPoolVersion((version) => version + 1);
  }, []);

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
        shipmentService.getShipments({
          ...baseParams,
          limit: AI_POOL_LIMIT,
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
      const poolRes = statusResults[SHIPMENT_STATUSES.length + 3];

      const today = startOfToday();
      const todayDeliveries = deliveredRes.shipments.filter((s) => {
        const arrival = s.actualArrival ? new Date(s.actualArrival) : null;
        return arrival && !Number.isNaN(arrival.getTime()) && arrival >= today;
      }).length;

      replacePool(poolRes.shipments);

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
    }

    // Fleet / hubs / system health / volume trend — real backend analytics,
    // loaded independently so an analytics outage never hides shipment KPIs.
    try {
      const analyticsData = await analyticsService.getDashboardAnalytics();
      if (mountedRef.current) setAnalytics(analyticsData);
    } catch (analyticsErr) {
      if (mountedRef.current) setAnalytics(null);
    }
    if (mountedRef.current) setLoading(false);
  }, [dispatch, scope, replacePool]);

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

  // Phase 8 Part 4: targeted AI refresh — when a shipment's status, timeline
  // or assignment changes, evict ONLY that shipment's aiClient entries and
  // re-run ONLY its analysis (cache invalidation + per-shipment refreshKey).
  const [refreshMap, setRefreshMap] = useState({});

  const bumpRefresh = useCallback((shipmentId) => {
    setRefreshMap((current) => ({ ...current, [shipmentId]: Date.now() }));
  }, []);

  const handleShipmentAffected = useCallback(
    ({ shipmentId, shipment }) => {
      if (!shipmentId) return;
      // Targeted cache eviction — every other analysis stays valid.
      aiService.invalidateFor("delay:risk", { shipmentId });
      aiService.invalidateFor("shipment:summary", { shipmentId });
      aiService.invalidateFor("shipment:recommendations", { shipmentId });
      if (shipment) upsertPool(shipment);
      bumpRefresh(shipmentId);
    },
    [upsertPool, bumpRefresh]
  );

  useAIIntelligenceSync({ onShipmentAffected: handleShipmentAffected, scope });

  const { counts } = dashboard;

  const active = counts ? computeActiveCount(counts) : 0;

  // Delay Risk + Shipment Summary (Phase 8 Parts 2–3): real AI analyses over
  // the live-ranked candidates. Fixed hook slots keep the hook order stable;
  // each slot skips the request while its candidate is undefined. The
  // aiClient dedupes + TTL-caches identical calls, so the dashboard never
  // duplicates requests; refreshKey re-runs ONLY the affected shipment after
  // its cache entry was evicted.
  const candidates = useMemo(
    () => selectCandidates([...aiPoolRef.current.values()]),
    [aiPoolVersion]
  );

  const slot0 = useDelayRisk({
    shipmentId: candidates[0]?._id,
    refreshKey: refreshMap[candidates[0]?._id],
  });
  const slot1 = useDelayRisk({
    shipmentId: candidates[1]?._id,
    refreshKey: refreshMap[candidates[1]?._id],
  });
  const slot2 = useDelayRisk({
    shipmentId: candidates[2]?._id,
    refreshKey: refreshMap[candidates[2]?._id],
  });
  const slot3 = useDelayRisk({
    shipmentId: candidates[3]?._id,
    refreshKey: refreshMap[candidates[3]?._id],
  });

  const summary0 = useShipmentSummary({
    shipmentId: candidates[0]?._id,
    refreshKey: refreshMap[candidates[0]?._id],
  });
  const summary1 = useShipmentSummary({
    shipmentId: candidates[1]?._id,
    refreshKey: refreshMap[candidates[1]?._id],
  });
  const summary2 = useShipmentSummary({
    shipmentId: candidates[2]?._id,
    refreshKey: refreshMap[candidates[2]?._id],
  });
  const summary3 = useShipmentSummary({
    shipmentId: candidates[3]?._id,
    refreshKey: refreshMap[candidates[3]?._id],
  });

  const rec0 = useAIRecommendations({
    shipmentId: candidates[0]?._id,
    refreshKey: refreshMap[candidates[0]?._id],
  });
  const rec1 = useAIRecommendations({
    shipmentId: candidates[1]?._id,
    refreshKey: refreshMap[candidates[1]?._id],
  });
  const rec2 = useAIRecommendations({
    shipmentId: candidates[2]?._id,
    refreshKey: refreshMap[candidates[2]?._id],
  });
  const rec3 = useAIRecommendations({
    shipmentId: candidates[3]?._id,
    refreshKey: refreshMap[candidates[3]?._id],
  });

  const riskSlots = [slot0, slot1, slot2, slot3];
  const summarySlots = [summary0, summary1, summary2, summary3];
  const recommendationSlots = [rec0, rec1, rec2, rec3];

  // Track the last moment any analysis resolved (initial load AND targeted
  // refreshes) for the AI Overview "Last AI refresh" stat.
  const [lastAiRefreshAt, setLastAiRefreshAt] = useState(null);
  const lastDataRef = useRef({});
  useEffect(() => {
    let changed = false;
    riskSlots.forEach((slot, index) => {
      if (slot.data && lastDataRef.current[`risk${index}`] !== slot.data) {
        lastDataRef.current[`risk${index}`] = slot.data;
        changed = true;
      }
    });
    summarySlots.forEach((slot, index) => {
      if (slot.data && lastDataRef.current[`summary${index}`] !== slot.data) {
        lastDataRef.current[`summary${index}`] = slot.data;
        changed = true;
      }
    });
    if (changed) setLastAiRefreshAt(new Date().toISOString());
  }, [slot0.data, slot1.data, slot2.data, slot3.data, summary0.data, summary1.data, summary2.data, summary3.data]);

  const aiInsights = useMemo(() => {
    const insights = [];
    candidates.forEach((shipment, index) => {
      const prediction = riskSlots[index]?.data;
      if (!prediction) return;
      insights.push(
        predictionToInsight(shipment, prediction, summarySlots[index]?.data)
      );
    });
    return insights;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidates, slot0.data, slot1.data, slot2.data, slot3.data, summary0.data, summary1.data, summary2.data, summary3.data]);

  // AI Overview stats — pure derivations from the resolved analyses, so the
  // overview always matches the cards (no separate requests).
  const aiOverview = useMemo(() => {
    const predictions = riskSlots.filter((slot) => Boolean(slot.data)).map((slot) => slot.data);
    const summaries = summarySlots.filter((slot) => Boolean(slot.data));
    const confidenceValues = predictions
      .map((p) => Math.round((Number(p?.confidence) || 0) * 100))
      .filter((value) => Number.isFinite(value));
    return {
      loading: riskSlots.some((slot) => slot.loading && !slot.data) ||
        summarySlots.some((slot) => slot.loading && !slot.data),
      stats: {
        total: predictions.length + summaries.length,
        highRisk: predictions.filter((p) => p?.risk === "High").length,
        mediumRisk: predictions.filter((p) => p?.risk === "Medium").length,
        lowRisk: predictions.filter((p) => p?.risk === "Low").length,
        avgConfidence: confidenceValues.length
          ? Math.round(
              confidenceValues.reduce((sum, value) => sum + value, 0) /
                confidenceValues.length
            )
          : 0,
        lastRefreshAt: lastAiRefreshAt,
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slot0.data, slot1.data, slot2.data, slot3.data, summary0.data, summary1.data, summary2.data, summary3.data, lastAiRefreshAt]);

  // AI Recommendations — ranked actions from the dedicated AI
  // recommendations analysis (Phase 9 Part 4), one per ranked candidate.
  // Errors are surfaced separately so a provider failure never looks like a
  // legitimate "no recommendations" state.
  const aiRecommendations = useMemo(() => {
    const items = [];
    candidates.forEach((shipment, index) => {
      const slot = recommendationSlots[index];
      const list = Array.isArray(slot?.data) ? slot.data : [];
      for (const recommendation of list) {
        if (!recommendation || typeof recommendation !== "object") continue;
        const text = recommendation.action || recommendation.title;
        if (!text) continue;
        items.push({
          id:
            recommendation.id ||
            `rec:${shipment._id}:${index}:${items.length}`,
          shipmentTitle: shipment.title || shipment.shipmentId || "Shipment",
          shipmentId: recommendation.shipmentId || shipment.shipmentId || null,
          mongoId: shipment._id,
          severity: (recommendation.severity || "low").toLowerCase(),
          confidence:
            slot?.data?.confidence != null
              ? Math.round(Number(slot.data.confidence) * 100)
              : undefined,
          text,
          title: recommendation.title || text,
          reason: recommendation.reason || undefined,
        });
      }
    });
    return items;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidates, rec0.data, rec1.data, rec2.data, rec3.data]);

  const aiRecommendationsLoading =
    recommendationSlots.some((slot) => slot.loading && !slot.data);

  const aiRecommendationsError =
    recommendationSlots
      .map((slot) => slot.error)
      .filter(Boolean)[0] || null;

  const onRetryRecommendations = () => {
    recommendationSlots.forEach((slot) => slot.retry?.());
  };

  const onRetryAI = () => {
    [...riskSlots, ...summarySlots, ...recommendationSlots].forEach((slot) =>
      slot.retry?.()
    );
  };

  // AI error visibility (Phase 9 Part 4): the first error from any analysis
  // slot is surfaced to the Command Center so AI failures are never silent
  // and never mistaken for a Low-risk result.
  const aiError = useMemo(() => {
    const slotErrors = [
      ...riskSlots,
      ...summarySlots,
      ...recommendationSlots,
    ]
      .map((slot) => slot.error)
      .filter(Boolean);
    return slotErrors[0] || null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slot0.error, slot1.error, slot2.error, slot3.error, summary0.error, summary1.error, summary2.error, summary3.error, rec0.error, rec1.error, rec2.error, rec3.error]);

  const summaryTarget = candidates[0];
  const aiSummaryTarget = summaryTarget
    ? {
        summary: summary0.data,
        loading: summary0.loading,
        title: `Summary — ${summaryTarget.title || summaryTarget.shipmentId || "Shipment"}`,
      }
    : null;

  // Real analytics (GET /api/analytics/dashboard) — fleet vehicles derived
  // from shipments carrying a vehicleNumber, real hubs with per-hub shipment
  // counts + utilization (only when an Admin configured hub capacity), live
  // system health and a createdAt-bucketed 7-day volume trend.
  const fleetVehicles = analytics?.fleet?.vehicles || [];
  const hubs = analytics?.hubs?.hubs || [];
  const systemServices = analytics?.system?.services || [];
  const analyticsTrends = {
    shipmentVolume: analytics?.volumeTrend || [],
  };

  const analyticsKpis = {
    fleetAvailability: analytics?.fleet?.availabilityPct ?? null,
    hubUtilization: analytics?.hubs?.overallUtilization ?? null,
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
    aiInsights,
    aiSummary: aiSummaryTarget,
    aiOverview,
    aiRecommendations,
    aiRecommendationsLoading,
    aiRecommendationsError,
    onRetryRecommendations,
    onRetryAI,
    aiError,
    fleetVehicles,
    hubs,
    systemServices,
    analyticsTrends,
    analyticsKpis,
    refetch: load,
  };
};

export default useAdminDashboardData;
