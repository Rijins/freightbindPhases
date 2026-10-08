import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import shipmentReducer from "../features/shipments/shipmentSlice";
import timelineReducer from "../features/timeline/timelineSlice";
// AUDIT FIX: Import notification reducer
import notificationReducer from "../features/notifications/notificationSlice";
// Phase 7 Part 5: dashboard synchronization store (KPIs, overview, activity)
import dashboardReducer from "../features/dashboard/dashboardSlice";
// Phase 9 Part 5: admin user management
import usersReducer from "../features/users/usersSlice";
// Phase 9 Part 7: system announcements
import announcementsReducer from "../features/announcements/announcementsSlice";
// Phase 9 Part 8: hub management + operational shipment chat
import hubsReducer from "../features/hubs/hubsSlice";
import chatReducer from "../features/chat/chatSlice";

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
    // Phase 9 Part 5: admin user management
    users: usersReducer,
    // Phase 9 Part 7: system announcements
    announcements: announcementsReducer,
    // Phase 9 Part 8: hubs + chat
    hubs: hubsReducer,
    chat: chatReducer,
  },
});

export default store;