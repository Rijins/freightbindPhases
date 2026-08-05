import Badge from "./Badge";

// Mirrors the normalized notification types produced by the notifications
// feature (n.type.toLowerCase().replace(/\s+/g, "_")).
const NOTIFICATION_TONES = {
  shipment_created: "blue",
  shipment_updated: "indigo",
  shipment_assigned: "purple",
  shipment_delayed: "amber",
  shipment_cancelled: "red",
  shipment_delivered: "emerald",
  announcement: "slate",
  ai_alert: "rose",
};

const humanizeType = (type = "") =>
  type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

/** Semantic badge for a notification type — tone and label from one source. */
const NotificationTypeBadge = ({ type, ...props }) => (
  <Badge tone={NOTIFICATION_TONES[type] || "slate"} {...props}>
    {humanizeType(type)}
  </Badge>
);

export default NotificationTypeBadge;