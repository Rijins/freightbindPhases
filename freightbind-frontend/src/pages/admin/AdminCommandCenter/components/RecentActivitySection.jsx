import { FiPackage } from "react-icons/fi";
import RecentActivityWidget from "../../../../components/widgets/RecentActivityWidget";
import {
  formatDateTime,
  SHIPMENT_STATUS_BADGE_TONES,
} from "../../../../utils/helpers";
import { NOTIFICATION_ACTIVITY_TONES } from "../../../../features/dashboard/dashboardSlice";

const humanizeType = (type = "") =>
  type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

// Dedupe-by-id guard for the fallback merge path (the slice-managed activity
// feed is already deduped by the dashboard reducer).
const dedupeById = (items) => {
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};

/**
 * RecentActivitySection — merged, real activity feed: the latest shipment
 * updates plus the latest notifications, newest first, deduped by id and kept
 * at a fixed page size. With Phase 7 Part 5, `activity` is the
 * realtime-synchronized feed managed by the dashboard slice (appended on
 * shipment updates, assignments, deliveries, delays and new notifications);
 * the shipments+notifications merge below remains as a fallback.
 */
const RecentActivitySection = ({ shipments = [], notifications = [], activity, onViewAll }) => {
  const shipmentItems = shipments.map((shipment) => ({
    id: `ship-${shipment._id}`,
    type: "shipment",
    icon: FiPackage,
    title: shipment.shipmentId,
    user: shipment.createdBy?.fullName,
    timestamp: formatDateTime(shipment.createdAt),
    status: shipment.status,
    badgeTone: SHIPMENT_STATUS_BADGE_TONES[shipment.status] || "slate",
    onClick: onViewAll,
  }));

  const notificationItems = notifications.map((notification) => ({
    id: `notif-${notification.id ?? notification._id}`,
    type: "notification",
    title: notification.title,
    timestamp: formatDateTime(notification.createdAt),
    status: humanizeType(notification.type),
    badgeTone: NOTIFICATION_ACTIVITY_TONES[notification.type] || "slate",
  }));

  // Synchronized feed from the dashboard slice (Phase 7 Part 5) — already
  // newest-first, deduped and page-size limited by its reducer.
  const activityItems = (activity || []).map((entry) => ({
    id: entry.id,
    type: entry.type,
    icon: entry.type === "shipment" ? FiPackage : undefined,
    title: entry.title,
    user: entry.user,
    timestamp: formatDateTime(entry.timestamp),
    status: entry.status,
    badgeTone: entry.badgeTone,
    onClick: entry.type === "shipment" ? onViewAll : undefined,
  }));

  const feed =
    activity !== undefined
      ? activityItems
      : dedupeById([...shipmentItems, ...notificationItems])
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 8);

  return (
    <RecentActivityWidget
      title="Recent Activity"
      subtitle="Shipment updates and notifications across the network."
      items={feed}
      onViewAll={onViewAll}
      emptyTitle="No activity yet"
      emptyDescription="Events will appear here as they happen."
    />
  );
};

export default RecentActivitySection;
