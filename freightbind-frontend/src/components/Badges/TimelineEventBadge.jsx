import Badge from "./Badge";

// Mirrors the event types emitted by the backend timeline service.
const TIMELINE_TONES = {
  Created: "blue",
  "Status Updated": "indigo",
  "Location Updated": "cyan",
  "Note Added": "slate",
  "Dispatcher Assigned": "purple",
  Delayed: "amber",
  Delivered: "emerald",
  Cancelled: "red",
};

/** Semantic badge for a timeline event type. */
const TimelineEventBadge = ({ eventType, ...props }) => (
  <Badge tone={TIMELINE_TONES[eventType] || "slate"} {...props}>
    {eventType || "—"}
  </Badge>
);

export default TimelineEventBadge;