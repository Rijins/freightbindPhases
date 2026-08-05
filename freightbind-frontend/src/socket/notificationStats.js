// Development-only instrumentation for the realtime notification listener.
// Tracks how many notification:* events the client received and how many were
// applied to Redux, plus the timestamp of the last `notification:new`.
//
// This module has NO top-level side effects and all writers are only called
// inside `import.meta.env.DEV` branches, so Vite/Rollup drops both the calls
// and the import from production builds.

import { SOCKET_EVENTS } from "../utils/constants";

const listeners = new Set();

const stats = {
  received: 0,
  applied: 0,
  lastNotificationAt: null,
};

// Cached snapshot — the SAME reference is returned until the stats change.
// Required by useSyncExternalStore, which loops if getSnapshot keeps
// returning a fresh object.
let snapshot = { ...stats };

const emitChange = () => {
  snapshot = { ...stats };
  for (const listener of listeners) {
    listener(snapshot);
  }
};

/** Counts any notification:* event received from the server. */
export const recordNotificationEvent = (eventName) => {
  stats.received += 1;
  if (eventName === SOCKET_EVENTS.NOTIFICATION) {
    stats.lastNotificationAt = Date.now();
  }
  emitChange();
};

/** Counts a `notification:new` payload dispatched into the Redux store. */
export const recordAppliedNotification = () => {
  stats.applied += 1;
  emitChange();
};

export const resetNotificationStats = () => {
  stats.received = 0;
  stats.applied = 0;
  stats.lastNotificationAt = null;
  emitChange();
};

export const getNotificationStats = () => snapshot;

/** Subscribes a snapshot listener (returns an unsubscribe function). */
export const subscribeNotificationStats = (listener) => {
  if (typeof listener === "function") listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};