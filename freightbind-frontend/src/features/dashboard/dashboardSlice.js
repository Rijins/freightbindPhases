// Phase 7 Part 5 — dashboard synchronization store.
//
// Single source of truth for everything a Command Center renders that is
// realtime-synced: KPI counts, per-status distribution, the Shipment
// Overview rows, the Delivered Today figure, and the merged Recent Activity
// feed. REST loads SEED this store (dashboardLoaded) and socket events apply
// minimal deltas (dashboardShipmentApplied / dashboardActivityAppended) — the
// same events the existing app-wide listeners consume, coordinated here for
// widget refresh without any polling or page reload.
//
// Rules honoured by every reducer:
//   - rows are updated in place by _id — pagination/sort/filters never change
//   - activity is deduped by id and kept newest-first at a fixed page size
//   - counts only ever move by the delta of a confirmed transition
//   - stats counters exist for the dev-only Socket Debug panel

import { createSlice } from "@reduxjs/toolkit";
import { normalizeNotification } from "../notifications/notificationSlice";
import { SHIPMENT_STATUS_BADGE_TONES } from "../../utils/helpers";

// Statuses counted as "Active" / "Pending" — mirrors the seeds built by
// useAdminDashboardData so REST-derived and event-derived values can never
// drift apart.
export const ACTIVE_STATUSES = ["Created", "Scheduled", "In Transit", "Delayed"];
export const PENDING_STATUSES = ["Draft", "Created"];
export const CRITICAL_PRIORITY = "Critical";

const RECENT_LIMIT = 6;
const ACTIVITY_LIMIT = 8;

// Mirror of RecentActivitySection's tone map — one source for both paths.
export const NOTIFICATION_ACTIVITY_TONES = {
  shipment_delivered: "emerald",
  shipment_delayed: "amber",
  shipment_cancelled: "red",
  ai_alert: "rose",
};

const humanizeType = (type = "") =>
  type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const startOfToday = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
};

// Same rule as the REST seed scan in useAdminDashboardData: a delivery counts
// as "today" when actualArrival is set and falls on/after the current day.
const isDeliveredToday = (actualArrival) => {
  const arrival = actualArrival ? new Date(actualArrival) : null;
  if (!arrival || Number.isNaN(arrival.getTime())) return false;
  return arrival >= startOfToday();
};

export const computeActiveCount = (counts) =>
  ACTIVE_STATUSES.reduce((sum, status) => sum + (counts?.[status] || 0), 0);

export const computePendingCount = (counts) =>
  PENDING_STATUSES.reduce((sum, status) => sum + (counts?.[status] || 0), 0);

const buildShipActivityEntry = (shipment) => ({
  id: `ship-${shipment._id}`,
  type: "shipment",
  title: shipment.shipmentId || shipment._id,
  user: shipment.createdBy?.fullName || null,
  timestamp: shipment.updatedAt || shipment.createdAt || new Date().toISOString(),
  status: shipment.status,
  badgeTone: SHIPMENT_STATUS_BADGE_TONES[shipment.status] || "slate",
});

const buildNotifActivityEntry = (raw) => {
  const notification = normalizeNotification(raw);
  if (!notification?.id) return null;
  return {
    id: `notif-${notification.id}`,
    type: "notification",
    title: notification.title || "Notification",
    user: null,
    timestamp: notification.createdAt || new Date().toISOString(),
    status: humanizeType(notification.type),
    badgeTone: NOTIFICATION_ACTIVITY_TONES[notification.type] || "slate",
  };
};

// Dedupe-by-id upsert, then newest-first sort, then trim to the fixed page
// size. The single path every activity writer goes through, so duplicate
// socket emissions / re-fetches can never duplicate feed rows.
const pushActivity = (state, entry) => {
  if (!entry?.id) return;
  const index = state.activity.findIndex((item) => item.id === entry.id);
  if (index !== -1) state.activity[index] = entry;
  else state.activity.push(entry);
  state.activity.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  if (state.activity.length > ACTIVITY_LIMIT) {
    state.activity = state.activity.slice(0, ACTIVITY_LIMIT);
  }
};

const initialState = {
  loaded: false,
  counts: null,
  statusDistribution: [],
  recentShipments: [],
  deliveredToday: { count: 0, capped: false },
  activity: [],
  scope: null,
  lastSeedAt: null,
  lastSyncAt: null,
  // Dev-only counters surfaced by the Socket Debug panel.
  updatesReceived: 0,
  shipmentUpdates: 0,
  notificationUpdates: 0,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    // REST seed (initial load AND reconnect recovery). Replaces the snapshot
    // data wholesale; the activity feed is MERGED so notification entries the
    // sync hook already appended are never wiped by a seed.
    dashboardLoaded: (state, action) => {
      const {
        counts,
        statusDistribution,
        recentShipments,
        deliveredToday,
        scope,
      } = action.payload || {};
      state.counts = counts || null;
      state.statusDistribution = statusDistribution || [];
      state.recentShipments = recentShipments || [];
      state.deliveredToday = deliveredToday || { count: 0, capped: false };
      state.scope = scope || null;
      state.loaded = true;
      state.lastSeedAt = new Date().toISOString();
      state.lastSyncAt = state.lastSyncAt || new Date().toISOString();
      for (const shipment of state.recentShipments) {
        pushActivity(state, buildShipActivityEntry(shipment));
      }
    },

    // One shipment event (shipment:updated / status-changed / assigned),
    // applied as a minimal delta. previousStatus / previousPriority come from
    // the sync hook's transition tracker (payload.previousStatus when the
    // backend supplied it), so idempotent duplicate emissions never
    // double-count.
    dashboardShipmentApplied: (state, action) => {
      const { shipment, previousStatus, previousPriority, isNew } =
        action.payload || {};
      if (!shipment?._id) return;

      if (state.counts) {
        if (isNew) {
          state.counts.total = (state.counts.total || 0) + 1;
          state.counts[shipment.status] = (state.counts[shipment.status] || 0) + 1;
          if (shipment.priority === CRITICAL_PRIORITY) {
            state.counts.Critical = (state.counts.Critical || 0) + 1;
          }
          if (shipment.status === "Delivered" && isDeliveredToday(shipment.actualArrival)) {
            state.deliveredToday.count += 1;
          }
        } else if (previousStatus && previousStatus !== shipment.status) {
          state.counts[previousStatus] = Math.max(0, (state.counts[previousStatus] || 0) - 1);
          state.counts[shipment.status] = (state.counts[shipment.status] || 0) + 1;
          if (shipment.status === "Delivered" && isDeliveredToday(shipment.actualArrival)) {
            state.deliveredToday.count += 1;
          }
          if (previousStatus === "Delivered") {
            state.deliveredToday.count = Math.max(0, state.deliveredToday.count - 1);
          }
        } else if (previousPriority && previousPriority !== shipment.priority) {
          if (previousPriority === CRITICAL_PRIORITY) {
            state.counts.Critical = Math.max(0, (state.counts.Critical || 0) - 1);
          }
          if (shipment.priority === CRITICAL_PRIORITY) {
            state.counts.Critical = (state.counts.Critical || 0) + 1;
          }
        }

        state.counts.active = computeActiveCount(state.counts);
        state.counts.Pending = computePendingCount(state.counts);
      }

      // Shipment Overview: update the affected row in place only — never
      // replace the list. A confirmed new shipment is prepended (newest
      // first) and the snapshot trimmed back to its fixed size.
      const index = state.recentShipments.findIndex((s) => s?._id === shipment._id);
      if (index !== -1) {
        state.recentShipments[index] = shipment;
      } else if (isNew) {
        state.recentShipments = [shipment, ...state.recentShipments].slice(0, RECENT_LIMIT);
      }

      pushActivity(state, buildShipActivityEntry(shipment));

      state.shipmentUpdates += 1;
      state.updatesReceived += 1;
      state.lastSyncAt = new Date().toISOString();
    },

    // Fresh notifications (watched from the notifications store — fed by the
    // existing realtime listener — never a second socket listener).
    dashboardActivityAppended: (state, action) => {
      const raws = Array.isArray(action.payload?.entries) ? action.payload.entries : [];
      if (!raws.length) return;
      for (const raw of raws) {
        pushActivity(state, buildNotifActivityEntry(raw));
      }
      state.notificationUpdates += 1;
      state.updatesReceived += 1;
      state.lastSyncAt = new Date().toISOString();
    },

    resetDashboardStats: (state) => {
      state.updatesReceived = 0;
      state.shipmentUpdates = 0;
      state.notificationUpdates = 0;
      state.lastSyncAt = null;
    },
  },
});

export const {
  dashboardLoaded,
  dashboardShipmentApplied,
  dashboardActivityAppended,
  resetDashboardStats,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
