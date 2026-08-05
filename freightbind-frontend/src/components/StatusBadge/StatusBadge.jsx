import Badge from "../Badges/Badge";

const STATUS_TONES = {
  Draft: "slate",
  Created: "blue",
  Scheduled: "indigo",
  "In Transit": "teal",
  Delayed: "amber",
  Delivered: "emerald",
  Cancelled: "red",
};

/** Reusable status badge — one visual style per shipment status. Never duplicate this markup. */
const StatusBadge = ({ status }) => (
  <Badge tone={STATUS_TONES[status] || "slate"}>{status || "—"}</Badge>
);

export default StatusBadge;
