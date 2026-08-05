import TimelineCard from "../../../../components/widgets/TimelineCard";
import { formatDateTime, SHIPMENT_STATUS_BADGE_TONES } from "../../../../utils/helpers";

/**
 * LiveTimeline — real, updatedAt-driven milestones for the six most recent
 * shipments, newest first. Every row maps to a live shipment document.
 */
const LiveTimeline = ({ shipments = [], loading = false }) => {
  const steps = shipments.map((shipment, index) => ({
    id: shipment._id,
    title: shipment.shipmentId,
    description: `${shipment.title} — ${shipment.status}`,
    timestamp: formatDateTime(shipment.updatedAt),
    status: index === 0 ? "current" : "completed",
    badge: index === 0 ? undefined : shipment.status,
    badgeTone: SHIPMENT_STATUS_BADGE_TONES[shipment.status] || "slate",
  }));

  return (
    <TimelineCard
      title="Live Shipment Milestones"
      subtitle="Latest status updates, newest first."
      steps={steps}
      currentStepId={shipments[0]?._id}
      loading={loading}
      emptyTitle="No shipment activity yet"
      emptyDescription="Milestones will appear here as shipments move."
    />
  );
};

export default LiveTimeline;
