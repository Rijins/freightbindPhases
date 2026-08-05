import Badge from "../Badges/Badge";

const PRIORITY_TONES = {
  Low: "slate",
  Medium: "blue",
  High: "amber",
  Critical: "red",
};

/** Reusable priority badge — one visual style per priority level. Never duplicate this markup. */
const PriorityBadge = ({ priority }) => (
  <Badge tone={PRIORITY_TONES[priority] || "slate"}>{priority || "—"}</Badge>
);

export default PriorityBadge;
