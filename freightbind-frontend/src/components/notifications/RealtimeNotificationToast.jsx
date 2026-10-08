import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { FiAlertTriangle, FiBell, FiCheckCircle, FiMessageSquare, FiX } from "react-icons/fi";
import { useRoleTheme } from "../../contexts/RoleThemeContext";
import { cn } from "../../utils/cn";

// Subtle realtime feedback for freshly delivered notifications.
//
// Driven ONLY by the existing Redux notifications store (the same store the
// app-wide useRealtimeNotifications socket listener already feeds), so this
// component registers zero socket listeners: one backend event can never
// produce two toasts, and nothing here can create or duplicate notifications.
//
// New arrivals are detected by id against a seen-set: the first non-empty
// list snapshot (the initial REST fetch) seeds the set, so page loads and
// reconnect refetches never replay history — only notifications that arrive
// AFTER that baseline are toasted.

const TOAST_DURATION_MS = 6000;
const MAX_TOASTS = 3;

const DEFAULT_TONE = { icon: FiBell, iconClass: "text-indigo-500 dark:text-indigo-400" };

const TONE_BY_TYPE = {
  ai_alert: { icon: FiAlertTriangle, iconClass: "text-rose-500 dark:text-rose-400" },
  warning: { icon: FiAlertTriangle, iconClass: "text-rose-500 dark:text-rose-400" },
  error: { icon: FiAlertTriangle, iconClass: "text-rose-500 dark:text-rose-400" },
  shipment_delivered: { icon: FiCheckCircle, iconClass: "text-emerald-500 dark:text-emerald-400" },
  success: { icon: FiCheckCircle, iconClass: "text-emerald-500 dark:text-emerald-400" },
  system_announcement: { icon: FiBell, iconClass: "text-indigo-500 dark:text-indigo-400" },
  chat_message: { icon: FiMessageSquare, iconClass: "text-harbor-500 dark:text-harbor-400" },
};

const CHAT_NOTIFICATION_TYPE = "chat_message";

const openNotification = (toast, navigate) => {
  if (!toast.shipmentId) return;
  // Chat notifications open the shipment's conversation directly; every
  // other notification keeps the existing shipment-detail navigation.
  const target =
    toast.type === CHAT_NOTIFICATION_TYPE
      ? `/shipments/${toast.shipmentId}/chat`
      : `/shipments/${toast.shipmentId}`;
  navigate(target);
};

const toToast = (notification) => ({
  id: notification.id,
  title: notification.title || "Notification",
  message: notification.message || "",
  type: notification.type,
  tone: TONE_BY_TYPE[notification.type] || DEFAULT_TONE,
  shipmentId: notification.relatedShipment?.id || notification.relatedShipment?._id || null,
  createdAt: notification.createdAt,
});

const RealtimeNotificationToast = () => {
  const navigate = useNavigate();
  const roleTheme = useRoleTheme();
  const notifications = useSelector((state) => state.notifications.notifications);

  const [toasts, setToasts] = useState([]);
  const seenIdsRef = useRef(new Set());
  const seededRef = useRef(false);
  const timersRef = useRef(new Map());

  const dismiss = (id) => {
    const timer = timersRef.current.get(id);
    if (timer) clearTimeout(timer);
    timersRef.current.delete(id);
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  useEffect(() => {
    const list = notifications || [];

    // Baseline: the first non-empty snapshot (the initial REST fetch) seeds
    // the seen-set, so pre-existing history is never replayed as toasts.
    if (!seededRef.current) {
      if (list.length === 0) return;
      seededRef.current = true;
      for (const notification of list) {
        if (notification?.id) seenIdsRef.current.add(notification.id);
      }
      return;
    }

    const fresh = list.filter(
      (notification) => notification?.id && !seenIdsRef.current.has(notification.id)
    );
    if (fresh.length === 0) return;

    for (const notification of fresh) {
      seenIdsRef.current.add(notification.id);
    }

    // List is newest-first; toast the newest arrivals (capped) on top.
    const newToasts = fresh.slice(0, MAX_TOASTS).map(toToast);
    setToasts((current) => [...newToasts, ...current].slice(0, MAX_TOASTS));
  }, [notifications]);

  // Arm the auto-dismiss timers for every new toast.
  useEffect(() => {
    for (const toast of toasts) {
      if (timersRef.current.has(toast.id)) continue;
      timersRef.current.set(
        toast.id,
        setTimeout(() => dismiss(toast.id), TOAST_DURATION_MS)
      );
    }
  }, [toasts]);

  // Clear every timer on unmount (provider teardown / logout).
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      for (const timer of timers.values()) clearTimeout(timer);
      timers.clear();
    };
  }, []);

  const openShipment = (toast) => {
    dismiss(toast.id);
    openNotification(toast, navigate);
  };

  return (
    <div
      className="pointer-events-none fixed bottom-16 right-4 z-[60] flex w-80 flex-col gap-2 sm:w-96"
      aria-live="polite"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 32, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 32, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="pointer-events-auto flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xl shadow-slate-900/10 dark:border-zinc-700 dark:bg-zinc-900"
          >
            <span className={cn("mt-0.5 shrink-0", toast.tone.iconClass)}>
              <toast.tone.icon size={18} aria-hidden="true" />
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                {toast.title}
              </p>
              <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-zinc-400">
                {toast.message}
              </p>
              {toast.shipmentId && (
                <button
                  type="button"
                  onClick={() => openShipment(toast)}
                  className={cn(
                    "mt-1.5 inline-flex items-center text-xs font-medium transition-colors hover:underline",
                    roleTheme.primary.text
                  )}
                >
                  {toast.type === CHAT_NOTIFICATION_TYPE ? "Open Chat →" : "View Shipment →"}
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss notification"
              className="shrink-0 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            >
              <FiX size={14} aria-hidden="true" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default RealtimeNotificationToast;
