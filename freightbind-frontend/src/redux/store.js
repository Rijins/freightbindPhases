import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import shipmentReducer from "../features/shipments/shipmentSlice";
import timelineReducer from "../features/timeline/timelineSlice";
// AUDIT FIX: Import notification reducer
import notificationReducer from "../features/notifications/notificationSlice";
// Phase 7 Part 5: dashboard synchronization store (KPIs, overview, activity)
import dashboardReducer from "../features/dashboard/dashboardSlice";

// Redux is the single source of truth for auth + shipment state.
// Slices live under features/<name>/ (feature-based structure) and are
// wired together here — no duplicated state elsewhere.
export const store = configureStore({
  reducer: {
    auth: authReducer,
    shipments: shipmentReducer,
    timeline: timelineReducer,
    // AUDIT FIX: Register notifications reducer
    notifications: notificationReducer,
    // Phase 7 Part 5: realtime-synced dashboard state
    dashboard: dashboardReducer,
  },
});

export default store;