import { useNavigate } from "react-router-dom";
import NotificationWidget from "../../../../components/widgets/NotificationWidget";
import { formatDateTime } from "../../../../utils/helpers";

// Notification types are snake_case on the backend (shipment_created, ...);
// map them onto the widget's semantic tone keys.
const TYPE_MAP = {
  shipment_delivered: "success",
  shipment_delayed: "warning",
  shipment_updated: "warning",
  announcement: "warning",
  shipment_cancelled: "critical",
  ai_alert: "critical",
  shipment_created: "info",
  shipment_assigned: "info",
};

/**
 * NotificationsPanel — real notifications from the notifications store
 * (GET /api/notifications via useNotifications, wired by the page so the
 * feed is fetched once and shared with RecentActivitySection). Mark-read
 * and mark-all-read write straight back through the slice.
 */
const NotificationsPanel = ({
  notifications = [],
  loading = false,
  onMarkRead,
  onMarkAllRead,
}) => {
  const navigate = useNavigate();

  const capitalizePriority = (priority = "") =>
    priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : priority;

  const items = notifications.map((notification) => ({
    id: notification.id ?? notification._id,
    type: TYPE_MAP[notification.type] || "default",
    title: notification.title,
    message: notification.message,
    timestamp: formatDateTime(notification.createdAt),
    priority: capitalizePriority(notification.priority),
    unread: !(notification.read ?? notification.isRead),
    onClick: onMarkRead ? () => onMarkRead(notification.id ?? notification._id) : undefined,
  }));

  return (
    <NotificationWidget
      title="Notifications"
      subtitle="Unread items are highlighted."
      items={items}
      loading={loading}
      onMarkAllRead={onMarkAllRead}
      onViewAll={() => navigate("/notifications")}
    />
  );
};

export default NotificationsPanel;
